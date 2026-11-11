import { finiteNumber, reportingPeriod } from './metrics.mjs';

// Verified Joyleaf accounts only. Never query every account attached to the agency key.
export const windsorSources = {
  instagram: { connector: 'instagram', account: '17841462104093765', label: 'Joyleaf Instagram', fields: { views: 'views', interactions: 'total_interactions', new_follows: 'follower_count_1d' } },
  facebook: { connector: 'facebook_organic', account: '120224484515319', label: 'Joy Leaf Facebook', fields: { views: 'page_impressions', interactions: 'page_post_engagements', page_visits: 'page_views_total', new_follows: 'page_daily_follows' } },
  linkedin: { connector: 'linkedin_organic', account: '97213401', label: 'JoyLeaf LinkedIn', fields: { impressions: 'account_analytics_impression_count', reactions: 'account_analytics_like_count' } }
};

export function parseWindsorDaily(rows, definition, period) {
  if (!Array.isArray(rows) || !rows.length) throw new Error('Windsor returned no daily rows.');
  const parseDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
    const timestamp = Date.parse(`${value}T00:00:00.000Z`);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value ? timestamp : NaN;
  };
  const start = parseDate(period?.start_date);
  const end = parseDate(period?.end_date);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) throw new Error('Windsor reporting window contains invalid calendar dates.');
  const expectedDays = (end - start) / 86400000 + 1;
  const dates = new Set();
  for (const row of rows) {
    if (String(row.account_id) !== definition.account) throw new Error('Windsor account mismatch; no data published.');
    const timestamp = parseDate(row.date);
    if (!Number.isFinite(timestamp) || timestamp < start || timestamp > end) throw new Error('Windsor returned invalid calendar dates or dates outside the requested reporting window.');
    if (dates.has(row.date)) throw new Error('Windsor returned duplicate daily rows; no totals published.');
    dates.add(row.date);
  }
  if (dates.size !== expectedDays) throw new Error(`Windsor returned ${dates.size} of ${expectedDays} days; incomplete totals withheld.`);
  const metrics = {};
  for (const [metric, field] of Object.entries(definition.fields)) {
    const values = rows.map(row => finiteNumber(row[field]));
    if (values.some(value => value === undefined || value < 0 || !Number.isSafeInteger(value))) continue;
    const total = values.reduce((sum, value) => sum + value, 0);
    if (Number.isSafeInteger(total)) metrics[metric] = total;
  }
  if (!Object.keys(metrics).length) throw new Error('Windsor returned no complete numeric metrics.');
  return metrics;
}

export function parseWindsorFollowers(rows, account) {
  if (!Array.isArray(rows) || rows.length !== 1 || String(rows[0].account_id) !== account) throw new Error('Windsor follower snapshot is missing or ambiguous.');
  const count = finiteNumber(rows[0].organization_follower_count);
  if (count === undefined || count < 0 || !Number.isSafeInteger(count)) throw new Error('Windsor returned an invalid follower snapshot.');
  return count;
}

export async function requestWindsor(definition, fields, period, apiKey, fetchImpl = fetch) {
  const query = new URLSearchParams({ api_key: apiKey, select_accounts: definition.account, fields: ['account_id', ...fields].join(','), date_from: period.start_date, date_to: period.end_date });
  // Windsor supports query-parameter auth only. Never log this URL, response body, or raw fetch error.
  let response;
  try {
    response = await fetchImpl(`https://connectors.windsor.ai/${definition.connector}?${query}`, { headers: { Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(180_000) });
  } catch { throw new Error('Windsor request failed or timed out; previous values retained.'); }
  if (!response.ok) throw new Error(`Windsor reporting HTTP ${response.status}; previous values retained.`);
  let body;
  try { body = await response.json(); } catch { throw new Error('Windsor returned invalid JSON.'); }
  if (body?.error || body?.status === 'pending' || body?.status === 'running') throw new Error('Windsor report is not ready or returned an error; previous values retained.');
  if (!Array.isArray(body?.data)) throw new Error('Windsor response did not contain data rows.');
  return body.data;
}

export async function fetchWindsorSource(sourceKey, apiKey, now = new Date(), fetchImpl = fetch) {
  const definition = windsorSources[sourceKey];
  if (!definition || !apiKey) return { status: 'unavailable', metrics: {}, reason: 'Windsor daily publishing requires the encrypted WINDSOR_API_KEY repository secret.' };
  const period = reportingPeriod(now);
  const metric_fields = { ...definition.fields };
  const metric_periods = {};
  const metrics = {};
  const reasons = [];
  try {
    Object.assign(metrics, parseWindsorDaily(await requestWindsor(definition, ['date', ...Object.values(definition.fields)], period, apiKey, fetchImpl), definition, period));
  } catch (error) { reasons.push(error.message); }
  if (sourceKey === 'linkedin') {
    try {
      metrics.followers = parseWindsorFollowers(await requestWindsor(definition, ['organization_follower_count'], { start_date: period.end_date, end_date: period.end_date }, apiKey, fetchImpl), definition.account);
      metric_fields.followers = 'organization_follower_count';
      metric_periods.followers = { label: `Current snapshot ${now.toISOString().slice(0, 10)}` };
    } catch (error) { reasons.push(error.message); }
  }
  if (sourceKey === 'instagram') reasons.push('Unique 28-day reach and non-follower reach are unavailable; daily unique reach is never summed.');
  const expected = { instagram: 5, facebook: 4, linkedin: 3 }[sourceKey];
  const count = Object.keys(metrics).length;
  if (count < Object.keys(definition.fields).length && !reasons.length) reasons.push('Some daily metrics were missing or invalid; those values remain historical.');
  return { status: count === expected ? 'success' : count ? 'partial' : 'failed', metrics, period, metric_fields, metric_periods, source_label: `Windsor.ai · ${definition.label}`, ...(reasons.length ? { reason: reasons.join(' ').slice(0, 180) } : {}) };
}
