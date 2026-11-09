import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { finiteNumber, reportingPeriod, parseGoogleMetrics, googleMetricKeys } from './metrics.mjs';

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

const DEFAULT_JOYLEAF_YOUTUBE_CHANNEL_ID = 'UC1IIAz60fxLfwyyXCQv-3sA';
let googleAccessTokenPromise;

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

async function getGoogleAccessToken() {
  if (!googleAccessTokenPromise) {
    googleAccessTokenPromise = (async () => {
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
    })();
  }
  try {
    return await googleAccessTokenPromise;
  } catch (error) {
    googleAccessTokenPromise = undefined;
    throw error;
  }
}

let googleLocationPromise;
async function discoverGoogleLocation(accessToken) {
  if (googleLocationPromise) return googleLocationPromise;
  googleLocationPromise = (async () => {
    const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' };
    const candidates = [];
    let accountPage;
    do {
      const accountQuery = accountPage ? `?pageToken=${encodeURIComponent(accountPage)}` : '';
      const accountResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/accounts${accountQuery}`, { headers, signal: AbortSignal.timeout(25_000) });
      const accountBody = await accountResponse.json();
      if (!accountResponse.ok) throw new Error(`Google account discovery HTTP ${accountResponse.status}.`);
      for (const account of accountBody.accounts || []) {
        let locationPage;
        do {
          const query = new URLSearchParams({ readMask: 'name,title', pageSize: '100', ...(locationPage ? { pageToken: locationPage } : {}) });
          const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?${query}`, { headers, signal: AbortSignal.timeout(25_000) });
          const body = await response.json();
          if (!response.ok) throw new Error(`Google location discovery HTTP ${response.status}.`);
          candidates.push(...(body.locations || []).map(location => ({ ...location, account: account.name })));
          locationPage = body.nextPageToken;
        } while (locationPage);
      }
      accountPage = accountBody.nextPageToken;
    } while (accountPage);
    const unique = [...new Map(candidates.map(location => [location.name, location])).values()];
    const configured = process.env.GOOGLE_LOCATION_NAME;
    // The dashboard names Joyleaf Dispensary, not the separate delivery listing.
    const expectedTitle = 'joyleaf weed dispensary';
    const matches = configured ? unique.filter(location => location.name === configured) : unique.filter(location => (location.title || '').trim().toLowerCase() === expectedTitle);
    if (matches.length !== 1) throw new Error(configured ? 'Configured Google location was not found in the authorized account.' : `Found ${matches.length} exact Joyleaf Weed Dispensary profiles. Set GOOGLE_LOCATION_NAME to the intended profile; no location was guessed.`);
    return matches[0];
  })();
  return googleLocationPromise;
}

async function fetchGoogleBusinessProfileSource() {
  try {
    const accessToken = await getGoogleAccessToken();
    const location = await discoverGoogleLocation(accessToken);
    // GBP reporting can lag. Query completed days and identify the exact period shown.
    const period = reportingPeriod(new Date(), 3);
    const query = new URLSearchParams();
    for (const metric of googleMetricKeys) query.append('dailyMetrics', metric);
    for (const [prefix, dateText] of [['dailyRange.startDate', period.start_date], ['dailyRange.endDate', period.end_date]]) {
      const date = new Date(`${dateText}T00:00:00Z`);
      query.set(`${prefix}.year`, String(date.getUTCFullYear()));
      query.set(`${prefix}.month`, String(date.getUTCMonth() + 1));
      query.set(`${prefix}.day`, String(date.getUTCDate()));
    }
    const response = await fetch(`https://businessprofileperformance.googleapis.com/v1/${location.name}:fetchMultiDailyMetricsTimeSeries?${query}`, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }, signal: AbortSignal.timeout(25_000) });
    const body = await response.json();
    if (!response.ok) throw new Error(`Google Business Profile HTTP ${response.status}.`);
    const metrics = parseGoogleMetrics(body);
    return { status: 'partial', metrics, period, source_label: location.title, reason: `Refreshed ${Object.keys(metrics).length} of 5 metrics. Photo views are not provided by Google Performance API; missing measures remain historical.` };
  } catch (error) {
    return { status: 'failed', metrics: {}, reason: String(error.message || error).slice(0, 180) };
  }
}

async function fetchGoogleReviewsSource() {
  try {
    const accessToken = await getGoogleAccessToken();
    const location = await discoverGoogleLocation(accessToken);
    // Only publish aggregate count/rating, never individual review text or reviewer identities.
    const response = await fetch(`https://mybusiness.googleapis.com/v4/${location.account}/${location.name}/reviews?pageSize=1`, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }, signal: AbortSignal.timeout(25_000) });
    const body = await response.json();
    if (!response.ok) throw new Error(`Google Business Profile Reviews HTTP ${response.status}.`);
    const metrics = {};
    const count = finiteNumber(body.totalReviewCount);
    const rating = finiteNumber(body.averageRating);
    if (count !== undefined && count >= 0 && Number.isInteger(count)) metrics.joyleaf_count = count;
    if (rating !== undefined && rating >= 1 && rating <= 5) metrics.rating = rating;
    if (!Object.keys(metrics).length) throw new Error('Google Reviews returned no aggregate rating or count.');
    return { status: 'partial', metrics, source_label: `Google Business Profile · ${location.title}`, period: { label: `Snapshot ${new Date().toISOString().slice(0, 10)}` }, reason: 'Joyleaf Google rating/count only. Competitor counts and star distribution remain historical, not refreshed.' };
  } catch (error) {
    return { status: 'failed', metrics: {}, reason: String(error.message || error).slice(0, 180) };
  }
}

async function fetchYouTubeSource() {
  try {
    const accessToken = await getGoogleAccessToken();
    const channelId = process.env.JOYLEAF_YOUTUBE_CHANNEL_ID || DEFAULT_JOYLEAF_YOUTUBE_CHANNEL_ID;
    if (!/^UC[\w-]{20,}$/.test(channelId)) throw new Error('JOYLEAF_YOUTUBE_CHANNEL_ID is invalid.');

    const period = reportingPeriod();
    const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' };
    const analyticsQuery = new URLSearchParams({
      ids: `channel==${channelId}`,
      startDate: period.start_date,
      endDate: period.end_date,
      metrics: 'views,subscribersGained'
    });
    const [analyticsResponse, channelResponse] = await Promise.all([
      fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${analyticsQuery}`, { headers, signal: AbortSignal.timeout(25_000) }),
      fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${encodeURIComponent(channelId)}`, { headers, signal: AbortSignal.timeout(25_000) })
    ]);
    const [analyticsBody, channelBody] = await Promise.all([analyticsResponse.json(), channelResponse.json()]);
    if (!analyticsResponse.ok) throw new Error(analyticsBody?.error?.message || `YouTube Analytics HTTP ${analyticsResponse.status}`);
    if (!channelResponse.ok) throw new Error(channelBody?.error?.message || `YouTube Data API HTTP ${channelResponse.status}`);

    const row = Array.isArray(analyticsBody.rows) ? analyticsBody.rows[0] : undefined;
    const metrics = {};
    const views = finiteNumber(row?.[0]);
    const newSubs = finiteNumber(row?.[1]);
    const subscribers = finiteNumber(channelBody?.items?.[0]?.statistics?.subscriberCount);
    if (views !== undefined) metrics.views = views;
    if (subscribers !== undefined) metrics.subscribers = subscribers;
    if (newSubs !== undefined) metrics.new_subs = newSubs;

    const metricCount = Object.keys(metrics).length;
    if (!metricCount) throw new Error('YouTube returned no mapped numeric dashboard metrics.');
    const expectedCount = fieldMap.sources.youtube.supportedMetrics.length;
    return {
      status: metricCount === expectedCount ? 'success' : 'partial',
      metrics,
      period,
      source_label: 'Joyleaf YouTube channel',
      ...(metricCount === expectedCount ? {} : { reason: `Received ${metricCount} of ${expectedCount} mapped YouTube metrics.` })
    };
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
    'Do not claim growth, momentum, acquisition, ROI or causation without comparable prior-period evidence. Report these period totals as a snapshot.',
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
const googleCredentialsConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
const sources = {};
for (const sourceKey of Object.keys(fieldMap.sources)) {
  sources[sourceKey] = sourceKey === 'google' && googleCredentialsConfigured
    ? await fetchGoogleBusinessProfileSource()
    : sourceKey === 'youtube' && googleCredentialsConfigured
      ? await fetchYouTubeSource()
      : sourceKey === 'reviews' && googleCredentialsConfigured && !config.reviews
        ? await fetchGoogleReviewsSource()
        : await fetchSource(sourceKey, config[sourceKey]);
}

const freshCount = Object.values(sources).filter((source) => source.status === 'success' || source.status === 'partial').length;
// Keep the established weekly AI-call budget when provider refreshes run daily.
const shouldGenerateInsight = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' || new Date().getUTCDay() === 1;
const insightContent = shouldGenerateInsight ? await generateInsight(sources) : null;
const now = new Date().toISOString();
const payload = {
  run: { trigger: process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' ? 'manual' : process.env.GITHUB_EVENT_NAME === 'push' ? 'deployment' : 'daily', requested_at: now },
  period: reportingPeriod(),
  sources,
  insight: insightContent ? { status: 'success', content: insightContent } : { status: 'failed', content: null },
  meta: { collector: 'github-actions', fresh_sources: freshCount }
};

fs.writeFileSync(payloadFile, JSON.stringify(payload, null, 2), 'utf8');
console.log(JSON.stringify({ fresh_sources: freshCount, output: payloadFile }));

const summaryLines = Object.entries(sources).map(([key, value]) => `| ${key} | ${value.status} | ${Object.keys(value.metrics || {}).join(', ') || 'none'} | ${(value.reason || '').replaceAll('|', '/')} |`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Provider refresh coverage\n\nA successful job is not proof that every provider is connected.\n\n| Source | Result | Metrics received | Details |\n|---|---|---|---|\n${summaryLines.join('\n')}\n`);
for (const [key, source] of Object.entries(sources)) {
  if (source.status !== 'success') console.log(`::warning title=${key} refresh::${source.status}: ${(source.reason || 'Incomplete source').replace(/[\r\n%]/g, ' ')}`);
}
