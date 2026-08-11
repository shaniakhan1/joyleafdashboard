#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import process from 'node:process';

const [dataFile, payloadFile, outputFile = dataFile] = process.argv.slice(2);

if (!dataFile || !payloadFile) {
  throw new Error('Usage: node merge_dashboard_data.mjs <data.js> <refresh-payload.json> [output.js]');
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const fieldMap = JSON.parse(fs.readFileSync(path.join(root, 'automation/make/mappings/field-map.json'), 'utf8'));
const originalDataSource = fs.readFileSync(dataFile, 'utf8');
const payload = JSON.parse(fs.readFileSync(payloadFile, 'utf8'));

function loadDashboardData(source) {
  const context = { DASHBOARD_DATA: undefined };
  vm.runInNewContext(`${source}\n;globalThis.__dashboard_data__ = DASHBOARD_DATA;`, context, { timeout: 1000 });
  if (!context.__dashboard_data__ || typeof context.__dashboard_data__ !== 'object') {
    throw new Error('data.js must assign an object to DASHBOARD_DATA.');
  }
  return structuredClone(context.__dashboard_data__);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isAllowedSourceStatus(status) {
  return ['success', 'partial', 'unavailable', 'failed'].includes(status);
}

function sanitizeReason(reason) {
  if (typeof reason !== 'string') return undefined;
  return reason.replace(/[\r\n]+/g, ' ').trim().slice(0, 180) || undefined;
}

function monthKey(label) {
  return typeof label === 'string' ? label.trim().toLowerCase() : '';
}

function normalizeInsight(insight, previous) {
  const valid = insight && typeof insight === 'object' &&
    typeof insight.title === 'string' && insight.title.trim() &&
    typeof insight.body === 'string' && insight.body.trim() &&
    ['green', 'purple', 'gold', 'red'].includes(insight.tone) &&
    Array.isArray(insight.source_keys) &&
    ['fresh', 'partial', 'stale'].includes(insight.status);

  if (!valid) return previous;
  return {
    title: insight.title.trim().slice(0, 100),
    body: insight.body.trim().slice(0, 360),
    tone: insight.tone,
    source_keys: insight.source_keys.filter((key) => typeof key === 'string').slice(0, 3),
    status: insight.status
  };
}

const data = loadDashboardData(originalDataSource);
const now = typeof payload?.run?.requested_at === 'string' ? payload.run.requested_at : new Date().toISOString();
const previousAutomation = data.automation && typeof data.automation === 'object' ? data.automation : {};
const previousInsight = previousAutomation.generated_insight || {
  title: 'Dashboard insight pending',
  body: 'The next successful data refresh will generate an evidence-based dashboard insight.',
  tone: 'purple',
  source_keys: [],
  status: 'stale'
};

const sourceStatus = {};
const updatedSources = [];
const staleSources = [];
let updatedMetricCount = 0;

for (const [sourceKey, config] of Object.entries(fieldMap.sources)) {
  const incomingSource = payload?.sources?.[sourceKey] || { status: 'unavailable', metrics: {}, reason: 'No source payload received.' };
  const status = isAllowedSourceStatus(incomingSource.status) ? incomingSource.status : 'failed';
  const metrics = incomingSource.metrics && typeof incomingSource.metrics === 'object' ? incomingSource.metrics : {};
  const target = data[config.dashboardPath];
  let changedForSource = 0;

  if ((status === 'success' || status === 'partial') && target && typeof target === 'object') {
    for (const metric of config.supportedMetrics || []) {
      if (isFiniteNumber(metrics[metric])) {
        target[metric] = metrics[metric];
        changedForSource += 1;
        updatedMetricCount += 1;
      }
    }

    for (const changeMetric of fieldMap.derivedMetrics?.fields?.[sourceKey] || []) {
      if (isFiniteNumber(metrics[changeMetric])) {
        target[changeMetric] = metrics[changeMetric];
        changedForSource += 1;
        updatedMetricCount += 1;
      }
    }

    const incomingMonth = payload?.period?.month;
    const existingMonth = data?.period?.month;
    if (changedForSource && incomingMonth && monthKey(incomingMonth) !== monthKey(existingMonth)) {
      for (const [metric, historyField] of Object.entries(config.history || {})) {
        if (isFiniteNumber(metrics[metric]) && Array.isArray(target[historyField])) {
          target[historyField] = [...target[historyField].slice(-5), metrics[metric]];
        }
      }
    }
  }

  const dashboardStatus = changedForSource > 0
    ? (status === 'partial' ? 'partial' : 'fresh')
    : 'stale';
  sourceStatus[sourceKey] = {
    status: dashboardStatus,
    last_attempt: now,
    ...(changedForSource > 0 ? { last_success: now } : {}),
    ...(sanitizeReason(incomingSource.reason) ? { reason: sanitizeReason(incomingSource.reason) } : {})
  };

  if (changedForSource > 0) updatedSources.push(sourceKey);
  else staleSources.push(sourceKey);
}

if (updatedMetricCount > 0 && payload?.period && typeof payload.period === 'object') {
  if (typeof payload.period.label === 'string' && payload.period.label.trim()) data.period.label = payload.period.label.trim().slice(0, 80);
  if (typeof payload.period.month === 'string' && payload.period.month.trim()) data.period.month = payload.period.month.trim().slice(0, 40);
}

const incomingInsight = payload?.insight?.status === 'success' ? payload.insight.content : null;
const generatedInsight = normalizeInsight(incomingInsight, previousInsight);

data.automation = {
  version: 1,
  last_attempt: now,
  ...(updatedMetricCount > 0 ? { last_success: now } : {}),
  trigger: payload?.run?.trigger === 'manual' ? 'manual' : 'weekly',
  metrics_updated: updatedMetricCount,
  updated_sources: updatedSources,
  stale_sources: staleSources,
  source_status: sourceStatus,
  generated_insight: generatedInsight
};

const rendered = `// JOYLEAF DASHBOARD DATA FILE\n// ============================================================\n// Managed by the single Make refresh scenario. See automation/make/.\n// Stale-source policy: unavailable or failed values are retained, never zeroed.\n// ============================================================\n\nconst DASHBOARD_DATA = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync(outputFile, rendered, 'utf8');

console.log(JSON.stringify({
  metrics_updated: updatedMetricCount,
  updated_sources: updatedSources,
  stale_sources: staleSources,
  output_file: outputFile
}));
