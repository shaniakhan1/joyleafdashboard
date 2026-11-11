import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { parseGoogleMetrics, parseGoogleReviewMetrics, googleReviewError, googleMetricKeys, reportingPeriod } from './metrics.mjs';
const date = { year: 2026, month: 11, day: 1 };
const series = (key, values) => ({ dailyMetric: key, timeSeries: { datedValues: values.map(value => ({ date, ...(value === undefined ? {} : { value }) })) } });
const body = (...items) => ({ multiDailyMetricTimeSeries: [{ dailyMetricTimeSeries: items }] });
const root = path.resolve(import.meta.dirname, '../..');
const readData = file => vm.runInNewContext(`${fs.readFileSync(file, 'utf8')}\nDASHBOARD_DATA`);

test('official nested envelope and int64 strings are parsed without false zeros', () => {
  const result = parseGoogleMetrics(body(...googleMetricKeys.map(key => series(key, ['12', '3']))));
  assert.deepEqual(result, { searches: 60, direction_requests: 15, phone_calls: 15, website_clicks: 15 });
});
test('a documented zero is accepted; missing metrics are not invented', () => {
  assert.deepEqual(parseGoogleMetrics(body(series('CALL_CLICKS', ['0', undefined]))), { phone_calls: 0 });
});
test('empty response, invalid values and old wrong shape do not become traffic zero', () => {
  for (const input of [{}, body(), body(series('CALL_CLICKS', [])), body(series('CALL_CLICKS', ['not a number'])), { multiDailyMetricTimeSeries: [series('CALL_CLICKS', ['3'])] }]) {
    assert.throws(() => parseGoogleMetrics(input), /no valid/);
  }
});
test('duplicate metric series are rejected rather than double-counted', () => {
  assert.throws(() => parseGoogleMetrics(body(series('CALL_CLICKS', ['3']), series('CALL_CLICKS', ['4']))), /duplicate/);
});
test('impressions require all search and maps components', () => {
  const result = parseGoogleMetrics(body(series(googleMetricKeys[0], ['10']), series('CALL_CLICKS', ['3'])));
  assert.deepEqual(result, { phone_calls: 3 });
});
test('report periods are 28 completed days with provider-specific lag', () => {
  assert.equal(reportingPeriod(new Date('2026-11-09T16:00:00Z')).start_date, '2026-10-12');
  assert.equal(reportingPeriod(new Date('2026-11-09T16:00:00Z')).end_date, '2026-11-08');
  assert.equal(reportingPeriod(new Date('2026-11-09T16:00:00Z'), 3).end_date, '2026-11-06');
});
test('partial merge retains actual prior values and success dates but clears old comparisons', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'joyleaf-merge-'));
  try {
    const prior = readData(path.join(root, 'data.js'));
    const oldSuccess = '2026-10-01T00:00:00Z';
    prior.automation.source_status.instagram.last_success = oldSuccess;
    prior.automation.source_status.google.metric_status = { photo_views: { status: 'fresh', last_success: oldSuccess } };
    const input = path.join(dir, 'data.js'), payload = path.join(dir, 'payload.json'), output = path.join(dir, 'output.js');
    fs.writeFileSync(input, `const DASHBOARD_DATA = ${JSON.stringify(prior)};`);
    fs.writeFileSync(payload, JSON.stringify({ run: { requested_at: '2026-11-09T14:00:00Z', trigger: 'daily' }, sources: { google: { status: 'partial', metrics: { searches: 123, direction_requests: 0 }, period: { start_date: '2026-10-10', end_date: '2026-11-06' } }, youtube: { status: 'failed', metrics: {} } }, insight: { status: 'failed' } }));
    execFileSync(process.execPath, [path.join(root, '.github/scripts/merge_dashboard_data.mjs'), input, payload, output]);
    const merged = readData(output);
    assert.equal(merged.google.searches, 123);
    assert.equal(merged.google.direction_requests, 0);
    assert.equal(merged.google.photo_views, prior.google.photo_views);
    assert.equal(merged.google.searches_change, null);
    assert.equal(merged.automation.source_status.instagram.last_success, oldSuccess);
    assert.equal(merged.automation.source_status.google.metric_status.photo_views.last_success, oldSuccess);
    assert.equal(merged.automation.source_status.google.metric_status.photo_views.status, 'stale');
    assert.equal(merged.automation.source_status.google.metric_status.searches.status, 'fresh');
    assert.equal(merged.automation.generated_insight.status, 'stale');
    assert.equal(JSON.stringify(merged.google.search_history), JSON.stringify(prior.google.search_history));
    assert.equal(merged.automation.source_status.google.snapshots.at(-1).period.end_date, '2026-11-06');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
test('no-credential collection fails closed and does not call providers', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'joyleaf-collector-'));
  try {
    const file = path.join(dir, 'payload.json');
    const env = { ...process.env, WINDSOR_API_KEY: '', GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '', GOOGLE_REFRESH_TOKEN: '', JOYLEAF_SOURCE_CONFIG: '', OPENAI_API_KEY: '' };
    execFileSync(process.execPath, [path.join(root, '.github/scripts/collect_live_metrics.mjs'), path.join(root, 'data.js'), file], { env });
    const payload = JSON.parse(fs.readFileSync(file));
    assert.equal(payload.meta.fresh_sources, 0);
    assert.ok(Object.values(payload.sources).every(source => source.status === 'unavailable' && Object.keys(source.metrics).length === 0));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('review parser keeps only valid public aggregate rating and count', () => {
  assert.deepEqual(parseGoogleReviewMetrics({totalReviewCount: 123, averageRating: 4.9, reviews: [{reviewer:'private',comment:'private'}]}), {joyleaf_count:123,rating:4.9});
  assert.deepEqual(parseGoogleReviewMetrics({totalReviewCount:0}), {joyleaf_count:0});
  assert.deepEqual(parseGoogleReviewMetrics({totalReviewCount:'57',averageRating:'4.8'}), {joyleaf_count:57,rating:4.8});
  for (const invalid of [{}, {totalReviewCount:-1,averageRating:6}, {totalReviewCount:1.5}, {totalReviewCount:NaN}, {totalReviewCount:9007199254740992}, {totalReviewCount:true,averageRating:''}]) assert.throws(()=>parseGoogleReviewMetrics(invalid), /no valid aggregate/);
});
test('review errors expose only approved diagnostic codes, never provider text or secrets', () => {
  const result = googleReviewError(403, {error:{status:'PERMISSION_DENIED',message:'secret=https://private',details:[{reason:'SERVICE_DISABLED',metadata:{service:'mybusiness.googleapis.com',consumer:'private'}},{reason:'SECRET',metadata:{service:'private'}}]}});
  assert.equal(result,'Google Business Profile Reviews HTTP 403 (PERMISSION_DENIED; SERVICE_DISABLED; mybusiness.googleapis.com).');
  assert.equal(googleReviewError(401,{error:{message:'secret'}}),'Google Business Profile Reviews HTTP 401.');
});
