import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const [dataFile, payloadFile] = process.argv.slice(2);
if (!dataFile || !payloadFile) {
  throw new Error('Usage: node collect_live_metrics.mjs <data.js> <refresh-payload.json>');
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const fieldMap = JSON.parse(fs.readFileSync(path.join(root, 'automation/make/mappings/field-map.json'), 'utf8'));
const sourceText = fs.readFileSync(dataFile, 'utf8');
const context = { DASHBOARD_DATA: undefined };
vm.runInNewContext(`${sourceText}\n;globalThis.__dashboard_data__ = DASHBOARD_DATA;`, context, { timeout: 1000 });
const priorData = context.__dashboard_data__;
if (!priorData || typeof priorData !== 'object') throw new Error('data.js did not define DASHBOARD_DATA.');

function parseConfig() {
  const raw = process.env.JOYLEAF_SOURCE_CONFIG;
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('must be an object');
    return value;
  } catch (error) {
    throw new Error(`JOYLEAF_SOURCE_CONFIG is not valid JSON: ${error.message}`);
  }
}

function getAtPath(input, expression) {
  if (!expression) return input;
  const tokens = String(expression)
    .replace(/^\$\.?/, '')
    .replace(/\["([^"\]]+)"\]/g, '.$1')
    .replace(/\['([^'\]]+)'\]/g, '.$1')
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
  return tokens.reduce((value, token) => value == null ? undefined : value[token], input);
}

function finiteNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function sourceTemplate(sourceKey, reason) {
  return { status: 'unavailable', metrics: {}, ...(reason ? { reason } : {}) };
}

async function fetchSource(sourceKey, definition) {
  const supportedMetrics = fieldMap.sources[sourceKey].supportedMetrics || [];
  if (!definition || typeof definition !== 'object') {
    return sourceTemplate(sourceKey, 'No source endpoint configuration was supplied.');
  }
  if (typeof definition.url !== 'string' || !/^https:\/\//.test(definition.url)) {
    return sourceTemplate(sourceKey, 'Source endpoint URL is missing or invalid.');
  }

  const headers = { Accept: 'application/json', ...(definition.headers && typeof definition.headers === 'object' ? definition.headers : {}) };
  if (typeof definition.token === 'string' && definition.token.trim()) {
    headers.Authorization = definition.authorization || `Bearer ${definition.token.trim()}`;
  }

  let response;
  let payload;
  try {
    response = await fetch(definition.url, {
      method: String(definition.method || 'GET').toUpperCase(),
      headers,
      ...(definition.body == null ? {} : { body: typeof definition.body === 'string' ? definition.body : JSON.stringify(definition.body) }),
      signal: AbortSignal.timeout(25_000)
    });
    const text = await response.text();
    try { payload = text ? JSON.parse(text) : {}; }
    catch { throw new Error(`Expected JSON response but received HTTP ${response.status}.`); }
    if (!response.ok) throw new Error(`HTTP ${response.status}${payload?.error?.message ? `: ${payload.error.message}` : ''}`);
  } catch (error) {
    return { status: 'failed', metrics: {}, reason: String(error.message || error).slice(0, 180) };
  }

  const metricPaths = definition.metric_paths && typeof definition.metric_paths === 'object' ? definition.metric_paths : {};
  const metricsRoot = getAtPath(payload, definition.metrics_root || 'metrics');
  const metrics = {};
  for (const metric of supportedMetrics) {
    const rawValue = Object.hasOwn(metricPaths, metric)
      ? getAtPath(payload, metricPaths[metric])
      : metricsRoot && typeof metricsRoot === 'object'
        ? metricsRoot[metric]
        : payload?.[metric];
    const value = finiteNumber(rawValue);
    if (value !== undefined) metrics[metric] = value;
  }

  const metricCount = Object.keys(metrics).length;
  if (!metricCount) {
    return { status: 'failed', metrics: {}, reason: 'Endpoint returned no mapped numeric dashboard metrics.' };
  }
  return {
    status: metricCount === supportedMetrics.length ? 'success' : 'partial',
    metrics,
    ...(metricCount === supportedMetrics.length ? {} : { reason: `Received ${metricCount} of ${supportedMetrics.length} mapped metrics.` })
  };
}

function currentPeriod() {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  const label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(start) +
    ' – ' + new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(end);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(end);
  return { label, month };
}

async function getGoogleAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN.');
  }
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }),
    signal: AbortSignal.timeout(25_000)
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error(body?.error_description || body?.error || `Google OAuth HTTP ${response.status}`);
  return body.access_token;
}

function sumGoogleValues(input) {
  if (Array.isArray(input)) return input.reduce((sum, value) => sum + sumGoogleValues(value), 0);
  if (!input || typeof input !== 'object') return 0;
  if (typeof input.value === 'number') return input.value;
  return Object.values(input).reduce((sum, value) => sum + sumGoogleValues(value), 0);
}

async function fetchGoogleBusinessProfileSource() {
  const location = process.env.GOOGLE_LOCATION_NAME;
  if (!location) return sourceTemplate('google', 'Missing GOOGLE_LOCATION_NAME (for example, locations/123456789).');
  try {
    const accessToken = await getGoogleAccessToken();
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 27);
    const query = new URLSearchParams();
    for (const metric of [
      'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
      'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
      'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
      'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
      'BUSINESS_DIRECTION_REQUESTS',
      'CALL_CLICKS',
      'WEBSITE_CLICKS'
    ]) query.append('dailyMetrics', metric);
    for (const [prefix, date] of [['dailyRange.startDate', start], ['dailyRange.endDate', end]]) {
      query.set(`${prefix}.year`, String(date.getUTCFullYear()));
      query.set(`${prefix}.month`, String(date.getUTCMonth() + 1));
      query.set(`${prefix}.day`, String(date.getUTCDate()));
    }
    const url = `https://businessprofileperformance.googleapis.com/v1/${location}:fetchMultiDailyMetricsTimeSeries?${query}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }, signal: AbortSignal.timeout(25_000) });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message || `Google Business Profile HTTP ${response.status}`);
    const totals = {};
    for (const series of body.multiDailyMetricTimeSeries || []) {
      totals[series.dailyMetric] = sumGoogleValues(series.timeSeries || series);
    }
    const searches = ['BUSINESS_IMPRESSIONS_DESKTOP_SEARCH','BUSINESS_IMPRESSIONS_DESKTOP_MAPS','BUSINESS_IMPRESSIONS_MOBILE_SEARCH','BUSINESS_IMPRESSIONS_MOBILE_MAPS']
      .reduce((sum, metric) => sum + (totals[metric] || 0), 0);
    const metrics = {
      searches,
      direction_requests: totals.BUSINESS_DIRECTION_REQUESTS || 0,
      phone_calls: totals.CALL_CLICKS || 0,
      website_clicks: totals.WEBSITE_CLICKS || 0
    };
    return { status: 'partial', metrics, reason: 'Google Performance API does not provide a mapped photo_views measure in this refresh.' };
  } catch (error) {
    return { status: 'failed', metrics: {}, reason: String(error.message || error).slice(0, 180) };
  }
}

async function generateInsight(sources) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const compactSourceData = Object.fromEntries(Object.entries(sources).map(([key, source]) => [key, { status: source.status, metrics: source.metrics }]));
  const prompt = [
    'Create one concise evidence-based dashboard insight for Joyleaf.',
    'Use only the source data supplied below. Do not invent metrics and explicitly account for unavailable or failed sources.',
    'Return JSON only with title, body, tone, source_keys, status.',
    'tone must be one of green, purple, gold, red; status must be fresh, partial, or stale; source_keys may contain at most three source names.',
    JSON.stringify(compactSourceData)
  ].join('\n');
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 220,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: AbortSignal.timeout(45_000)
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message || `HTTP ${response.status}`);
    const content = body?.choices?.[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.error(`OpenAI insight failed: ${String(error.message || error)}`);
    return null;
  }
}

const config = parseConfig();
const sources = {};
for (const sourceKey of Object.keys(fieldMap.sources)) {
  sources[sourceKey] = sourceKey === 'google' && process.env.GOOGLE_LOCATION_NAME
    ? await fetchGoogleBusinessProfileSource()
    : await fetchSource(sourceKey, config[sourceKey]);
}

const freshCount = Object.values(sources).filter((source) => source.status === 'success' || source.status === 'partial').length;
const insightContent = await generateInsight(sources);
const now = new Date().toISOString();
const payload = {
  run: { trigger: process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' ? 'manual' : 'weekly', requested_at: now },
  period: currentPeriod(),
  sources,
  insight: insightContent ? { status: 'success', content: insightContent } : { status: 'failed', content: null },
  meta: { collector: 'github-actions', fresh_sources: freshCount }
};

fs.writeFileSync(payloadFile, JSON.stringify(payload, null, 2), 'utf8');
console.log(JSON.stringify({ fresh_sources: freshCount, output: payloadFile }));
