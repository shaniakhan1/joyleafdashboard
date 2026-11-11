import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { windsorSources } from './windsor.mjs';
import { reportingPeriod } from './metrics.mjs';

const scripts = import.meta.dirname;
const fieldMap = JSON.parse(fs.readFileSync(new URL('../../automation/make/mappings/field-map.json', import.meta.url)));
const social = Object.keys(windsorSources);
const readData = file => JSON.parse(JSON.stringify(vm.runInNewContext(`${fs.readFileSync(file, 'utf8')}\nDASHBOARD_DATA`)));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value));
function syntheticPrior() {
  const data = { period: { label: 'Prior synthetic period' }, automation: { source_status: {} } };
  for (const [source, config] of Object.entries(fieldMap.sources)) {
    data[source] = Object.fromEntries(config.supportedMetrics.map(key => [key, 999]));
    data[source].test_history = [1, 2, 3];
    data.automation.source_status[source] = { status: 'fresh', last_attempt: '2026-11-09T08:00:00.000Z', last_success: '2026-11-09T08:00:00.000Z', source_label: `Synthetic ${source}`, period: { label: 'Prior synthetic period' }, metric_status: Object.fromEntries(config.supportedMetrics.map(key => [key, { status: 'fresh', last_success: '2026-11-09T08:00:00.000Z', period: { label: 'Prior synthetic period' } }])) };
  }
  return data;
}
function syntheticRows(collected_at) {
  const period = reportingPeriod(new Date(collected_at));
  const sources = {};
  for (const [source, definition] of Object.entries(windsorSources)) {
    sources[source] = { status: 'done', data: Array.from({ length: 28 }, (_, day) => ({
      account_id: definition.account,
      date: new Date(Date.parse(period.start_date) + day * 86400000).toISOString().slice(0, 10),
      ...Object.fromEntries(Object.values(definition.fields).map((field, index) => [field, index + 1]))
    })) };
  }
  sources.linkedin_followers = { status: 'done', data: [{ account_id: windsorSources.linkedin.account, organization_follower_count: 123 }] };
  return { collected_at, sources };
}

test('connected import, independent GitHub refresh, and later import failure preserve correct values and dates', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'joyleaf-importer-test-'));
  try {
    const before = syntheticPrior();
    const dataFile = path.join(dir, 'data.js'), rawFile = path.join(dir, 'raw.json'), payloadFile = path.join(dir, 'payload.json');
    fs.writeFileSync(dataFile, `const DASHBOARD_DATA = ${JSON.stringify(before)};`);
    const collected = '2026-11-10T10:00:00.000Z';
    writeJson(rawFile, syntheticRows(collected));
    execFileSync(process.execPath, [path.join(scripts, 'import_windsor_snapshot.mjs'), dataFile, rawFile]);
    const imported = readData(dataFile);
    for (const source of Object.keys(fieldMap.sources).filter(key => !social.includes(key))) {
      assert.deepEqual(imported[source], before[source]);
      assert.deepEqual(imported.automation.source_status[source], before.automation.source_status[source]);
    }
    assert.deepEqual(imported.automation.updated_sources, social);
    for (const source of social) {
      const meta = imported.automation.source_status[source];
      assert.equal(meta.managed_by, 'windsor-connected-app');
      assert.equal(meta.last_success, collected);
      assert.equal(meta.last_attempt, collected);
      Object.entries(windsorSources[source].fields).forEach(([key, field], index) => {
        assert.equal(imported[source][key], 28 * (index + 1));
        assert.equal(meta.metric_status[key].provider_field, field);
        assert.equal(meta.metric_status[key].last_success, collected);
        assert.deepEqual(meta.metric_status[key].period, reportingPeriod(new Date(collected)));
      });
    }
    assert.equal(imported.instagram.reach, 999);
    assert.equal(imported.automation.source_status.instagram.metric_status.reach.status, 'stale');
    assert.equal(imported.automation.source_status.instagram.status, 'partial');
    assert.equal(imported.linkedin.followers, 123);
    assert.deepEqual(imported.automation.source_status.linkedin.metric_status.followers.period, { label: 'Current snapshot 2026-11-10' });

    // Exercise the actual no-secret collector branch, then its real merger.
    const env = { ...process.env, WINDSOR_API_KEY: '', GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '', GOOGLE_REFRESH_TOKEN: '', JOYLEAF_SOURCE_CONFIG: '', OPENAI_API_KEY: '', GITHUB_STEP_SUMMARY: '' };
    execFileSync(process.execPath, [path.join(scripts, 'collect_live_metrics.mjs'), dataFile, payloadFile], { env });
    const payload = JSON.parse(fs.readFileSync(payloadFile));
    for (const source of social) assert.equal(payload.sources[source].preserve_external, true);
    execFileSync(process.execPath, [path.join(scripts, 'merge_dashboard_data.mjs'), dataFile, payloadFile]);
    const preserved = readData(dataFile);
    for (const source of social) {
      assert.deepEqual(preserved[source], imported[source]);
      assert.deepEqual(preserved.automation.source_status[source], imported.automation.source_status[source]);
      assert.ok(!preserved.automation.updated_sources.includes(source));
    }

    const failedTime = '2026-11-11T10:00:00.000Z';
    writeJson(rawFile, { collected_at: failedTime, sources: Object.fromEntries([...social, 'linkedin_followers'].map(source => [source, { status: 'failed', data: [] }])) });
    execFileSync(process.execPath, [path.join(scripts, 'import_windsor_snapshot.mjs'), dataFile, rawFile]);
    const failed = readData(dataFile);
    for (const source of social) {
      assert.deepEqual(failed[source], preserved[source]);
      const meta = failed.automation.source_status[source];
      assert.equal(meta.status, 'stale');
      assert.equal(meta.last_success, collected);
      assert.equal(meta.last_attempt, failedTime);
      assert.equal(meta.managed_by, 'windsor-connected-app');
      assert.deepEqual(meta.updated_metrics, []);
      for (const key of Object.keys(windsorSources[source].fields)) {
        assert.equal(meta.metric_status[key].status, 'stale');
        assert.equal(meta.metric_status[key].last_success, collected);
        assert.deepEqual(meta.metric_status[key].period, imported.automation.source_status[source].metric_status[key].period);
        assert.equal(meta.metric_status[key].provider_field, imported.automation.source_status[source].metric_status[key].provider_field);
      }
    }
    for (const source of ['google', 'youtube']) {
      assert.deepEqual(failed[source], preserved[source]);
      assert.deepEqual(failed.automation.source_status[source], preserved.automation.source_status[source]);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
