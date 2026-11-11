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
  if ((payload?.meta?.snapshot_only && !payload?.sources?.[sourceKey]) || (payload?.sources?.[sourceKey]?.preserve_external && previousAutomation.source_status?.[sourceKey]?.managed_by === 'windsor-connected-app')) {
    sourceStatus[sourceKey] = previousAutomation.source_status?.[sourceKey] || { status: 'stale' };
    if (sourceStatus[sourceKey].status === 'stale') staleSources.push(sourceKey);
    continue;
  }
  const incomingSource = payload?.sources?.[sourceKey] || { status: 'unavailable', metrics: {}, reason: 'No source payload received.' };
  const status = isAllowedSourceStatus(incomingSource.status) ? incomingSource.status : 'failed';
  const metrics = incomingSource.metrics && typeof incomingSource.metrics === 'object' ? incomingSource.metrics : {};
  const target = data[config.dashboardPath];
  const previous = previousAutomation.source_status?.[sourceKey] || {};
  const updatedMetrics = [];
  const metricStatus = {};
  const period = incomingSource.period || null;
  const canUpdate = (status === 'success' || status === 'partial') && target && typeof target === 'object';

  for (const metric of config.supportedMetrics || []) {
    const priorMetric = previous.metric_status?.[metric] || {};
    if (canUpdate && isFiniteNumber(metrics[metric]) && metrics[metric] >= 0) {
      target[metric] = metrics[metric];
      updatedMetrics.push(metric);
      updatedMetricCount += 1;
      const metricPeriod = incomingSource.metric_periods?.[metric] || period;
      metricStatus[metric] = { status: 'fresh', last_success: now, ...(metricPeriod ? { period: metricPeriod } : {}), ...(incomingSource.metric_fields?.[metric] ? { provider_field: sanitizeReason(incomingSource.metric_fields[metric]) } : {}) };
    } else {
      metricStatus[metric] = { ...priorMetric, status: priorMetric.status === 'invalid' ? 'invalid' : 'stale' };
    }
  }
  // Old percentage changes must not survive beside newly collected totals.
  for (const metric of fieldMap.derivedMetrics?.fields?.[sourceKey] || []) {
    if (canUpdate && isFiniteNumber(metrics[metric])) {
      target[metric] = metrics[metric];
      metricStatus[metric] = { status: 'fresh', last_success: now, ...(period ? { period } : {}) };
    } else {
      target[metric] = null;
      metricStatus[metric] = { ...(previous.metric_status?.[metric] || {}), status: 'stale' };
    }
  }
  // Keep legacy monthly arrays unchanged. Rolling 28-day totals are not calendar-month observations.
  if (updatedMetrics.length) {
    const snapshots = Array.isArray(previous.snapshots) ? previous.snapshots : [];
    const snapshot = { collected_at: now, ...(period ? { period } : {}), ...(incomingSource.metric_periods ? { metric_periods: incomingSource.metric_periods } : {}), ...(incomingSource.metric_fields ? { metric_fields: incomingSource.metric_fields } : {}), metrics: Object.fromEntries(updatedMetrics.map(key => [key, metrics[key]])) };
    const samePeriod = old => period?.end_date && old.period?.end_date === period.end_date;
    previous.snapshots = [...snapshots.filter(old => !samePeriod(old)), snapshot].slice(-35);
  }
  const dashboardStatus = updatedMetrics.length
    ? (status === 'partial' || updatedMetrics.length < config.supportedMetrics.length ? 'partial' : 'fresh')
    : 'stale';
  sourceStatus[sourceKey] = {
    ...previous,
    status: dashboardStatus,
    last_attempt: now,
    ...(updatedMetrics.length ? { last_success: now, ...(period ? { period } : {}) } : {}),
    ...(incomingSource.source_label ? { source_label: sanitizeReason(incomingSource.source_label) } : {}),
    ...(incomingSource.managed_by === 'windsor-connected-app' ? { managed_by: incomingSource.managed_by } : {}),
    updated_metrics: updatedMetrics,
    authorization_blocked: Boolean(incomingSource.authorization_blocked),
    metric_status: metricStatus
  };
  delete sourceStatus[sourceKey].reason;
  if (sanitizeReason(incomingSource.reason)) sourceStatus[sourceKey].reason = sanitizeReason(incomingSource.reason);
  if (updatedMetrics.length) updatedSources.push(sourceKey);
  else staleSources.push(sourceKey);
}

if (updatedMetricCount > 0 && payload?.period && typeof payload.period === 'object') {
  if (typeof payload.period.label === 'string' && payload.period.label.trim()) data.period.label = payload.period.label.trim().slice(0, 80);
  if (typeof payload.period.month === 'string' && payload.period.month.trim()) data.period.month = payload.period.month.trim().slice(0, 40);
}

const incomingInsight = payload?.insight?.status === 'success' ? payload.insight.content : null;
const generatedInsight = normalizeInsight(incomingInsight, { ...previousInsight, status: 'stale' });
if (incomingInsight && generatedInsight !== previousInsight) generatedInsight.generated_at = now;

data.automation = {
  version: 2,
  cadence: 'daily',
  stale_after_hours: 36,
  last_attempt: now,
  ...(updatedMetricCount > 0 ? { last_success: now } : previousAutomation.last_success ? { last_success: previousAutomation.last_success } : {}),
  trigger: ['manual', 'daily', 'deployment'].includes(payload?.run?.trigger) ? payload.run.trigger : 'daily',
  metrics_updated: updatedMetricCount,
  updated_sources: updatedSources,
  stale_sources: staleSources,
  source_status: sourceStatus,
  generated_insight: generatedInsight
};

const rendered = `// JOYLEAF DASHBOARD DATA FILE\n// ============================================================\n// Managed by the self-contained GitHub Actions daily refresh. See automation/github-actions/.\n// Stale-source policy: unavailable or failed values are retained, never zeroed.\n// ============================================================\n\nconst DASHBOARD_DATA = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync(outputFile, rendered, 'utf8');

console.log(JSON.stringify({
  metrics_updated: updatedMetricCount,
  updated_sources: updatedSources,
  stale_sources: staleSources,
  output_file: outputFile
}));
