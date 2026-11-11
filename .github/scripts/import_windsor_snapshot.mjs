#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { reportingPeriod } from './metrics.mjs';
import { windsorSources, parseWindsorDaily, parseWindsorFollowers } from './windsor.mjs';

// Deterministic importer for the authorized connected-app daily task. No credentials in this file/input.
const [dataFile, rawFile, outputFile = dataFile] = process.argv.slice(2);
if (!dataFile || !rawFile) throw new Error('Usage: import_windsor_snapshot.mjs <data.js> <provider-results.json> [output.js]');
const input = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
const collected = new Date(input.collected_at);
if (!Number.isFinite(collected.getTime())) throw new Error('A valid actual collection timestamp is required.');
const period = reportingPeriod(collected);
const sources = {};
for (const [key, definition] of Object.entries(windsorSources)) {
  const metrics = {}, reasons = [], metric_fields = { ...definition.fields }, metric_periods = {};
  try {
    if (input.sources?.[key]?.status !== 'done') throw new Error('Windsor daily report did not complete; previous values retained.');
    Object.assign(metrics, parseWindsorDaily(input.sources[key].data, definition, period));
  } catch (error) { reasons.push(error.message); }
  if (key === 'linkedin') {
    try {
      if (input.sources?.linkedin_followers?.status !== 'done') throw new Error('Windsor follower snapshot did not complete.');
      metrics.followers = parseWindsorFollowers(input.sources.linkedin_followers.data, definition.account);
      metric_fields.followers = 'organization_follower_count';
      metric_periods.followers = { label: `Current snapshot ${collected.toISOString().slice(0,10)}` };
    } catch (error) { reasons.push(error.message); }
  }
  if (key === 'instagram') reasons.push('Unique 28-day reach and non-follower reach are unavailable; daily unique reach is never summed.');
  const count = Object.keys(metrics).length;
  const expected = { instagram: 5, facebook: 4, linkedin: 3 }[key];
  if (count < Object.keys(definition.fields).length && !reasons.length) reasons.push('Some daily metrics were missing or invalid; those values remain historical.');
  sources[key] = { status: count === expected ? 'success' : count ? 'partial' : 'failed', metrics, period, metric_fields, metric_periods, managed_by: 'windsor-connected-app', source_label: `Windsor.ai · ${definition.label}`, ...(reasons.length ? { reason: reasons.join(' ').slice(0,180) } : {}) };
}
const payload = { run: { trigger: 'daily', requested_at: collected.toISOString() }, sources, meta: { snapshot_only: true } };
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'joyleaf-windsor-import-'));
try {
  const payloadFile = path.join(dir, 'payload.json');
  fs.writeFileSync(payloadFile, JSON.stringify(payload));
  execFileSync(process.execPath, [path.join(import.meta.dirname, 'merge_dashboard_data.mjs'), dataFile, payloadFile, outputFile], { stdio: 'inherit' });
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
console.log(JSON.stringify(Object.fromEntries(Object.entries(sources).map(([key,value]) => [key,{ status: value.status, metrics: value.metrics, reason: value.reason }]))));
