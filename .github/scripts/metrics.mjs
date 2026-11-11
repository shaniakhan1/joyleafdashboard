// Provider parsing is deliberately separate from credentials/network access so it can be regression-tested.
export function finiteNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

export function periodFromDates(start, end) {
  const format = (date, year = false) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', ...(year ? { year: 'numeric' } : {}), timeZone: 'UTC' }).format(date);
  return {
    start_date: start.toISOString().slice(0, 10), end_date: end.toISOString().slice(0, 10),
    label: `${format(start, start.getUTCFullYear() !== end.getUTCFullYear())} – ${format(end, true)}`,
    month: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(end)
  };
}

export function reportingPeriod(now = new Date(), lagDays = 1) {
  const end = new Date(now); end.setUTCHours(0, 0, 0, 0); end.setUTCDate(end.getUTCDate() - lagDays);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 27);
  return periodFromDates(start, end);
}

const impressionKeys = ['BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH', 'BUSINESS_IMPRESSIONS_MOBILE_MAPS'];
export const googleMetricKeys = [...impressionKeys, 'BUSINESS_DIRECTION_REQUESTS', 'CALL_CLICKS', 'WEBSITE_CLICKS'];

export function parseGoogleMetrics(body) {
  // Official response: multiDailyMetricTimeSeries[].dailyMetricTimeSeries[].timeSeries.datedValues[].
  // int64 values are JSON strings. Missing series/points are unknown, never invented zeroes.
  const totals = {};
  for (const group of body?.multiDailyMetricTimeSeries || []) {
    for (const series of group.dailyMetricTimeSeries || []) {
      if (!googleMetricKeys.includes(series.dailyMetric)) continue;
      if (Object.hasOwn(totals, series.dailyMetric)) throw new Error('Google returned duplicate metric series; totals were not published.');
      const points = series.timeSeries?.datedValues;
      if (!Array.isArray(points) || !points.length) continue;
      // Google documents omitted DatedValue.value as zero, but only for an actual dated point.
      const values = points.map(point => !point?.date ? undefined : !Object.hasOwn(point, 'value') ? 0 : finiteNumber(point.value));
      if (values.some(value => value === undefined || value < 0 || !Number.isSafeInteger(value))) continue;
      totals[series.dailyMetric] = values.reduce((a, b) => a + b, 0);
    }
  }
  const metrics = {};
  if (impressionKeys.every(key => Object.hasOwn(totals, key))) metrics.searches = impressionKeys.reduce((sum, key) => sum + totals[key], 0);
  for (const [key, metric] of Object.entries({ BUSINESS_DIRECTION_REQUESTS: 'direction_requests', CALL_CLICKS: 'phone_calls', WEBSITE_CLICKS: 'website_clicks' })) {
    if (Object.hasOwn(totals, key)) metrics[metric] = totals[key];
  }
  if (!Object.keys(metrics).length) throw new Error('Google returned no valid dated metric values; previous values retained.');
  return metrics;
}


export function parseGoogleReviewMetrics(body) {
  const metrics = {};
  const count = finiteNumber(body?.totalReviewCount);
  const rating = finiteNumber(body?.averageRating);
  if (count !== undefined && count >= 0 && Number.isSafeInteger(count)) metrics.joyleaf_count = count;
  if (rating !== undefined && rating >= 1 && rating <= 5) metrics.rating = rating;
  if (!Object.keys(metrics).length) throw new Error('Google Reviews returned no valid aggregate rating or count.');
  return metrics;
}

export function googleReviewError(status, body) {
  // Whitelist provider diagnostic codes, never publish raw messages, URLs, tokens or review content.
  const codes = new Set(['SERVICE_DISABLED', 'ACCESS_TOKEN_SCOPE_INSUFFICIENT', 'IAM_PERMISSION_DENIED', 'PERMISSION_DENIED', 'UNAUTHENTICATED', 'NOT_FOUND', 'INVALID_ARGUMENT', 'RESOURCE_EXHAUSTED', 'BILLING_DISABLED', 'CONSUMER_INVALID', 'API_KEY_SERVICE_BLOCKED', 'USER_PROJECT_DENIED']);
  const details = Array.isArray(body?.error?.details) ? body.error.details : [];
  const parts = [body?.error?.status, ...details.map(detail => detail?.reason)].filter(code => codes.has(code));
  const services = details.map(detail => detail?.metadata?.service).filter(service => service === 'mybusiness.googleapis.com');
  return `Google Business Profile Reviews HTTP ${Number.isInteger(status) ? status : 'error'}${parts.length || services.length ? ` (${[...new Set([...parts, ...services])].join('; ')})` : ''}.`;
}
