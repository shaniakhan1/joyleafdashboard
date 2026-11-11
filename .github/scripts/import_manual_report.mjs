#!/usr/bin/env node
import fs from 'node:fs';

// Imports only explicitly verified, aggregate-only Weedmaps reports. No raw CSV or credentials are published.
const [dataFile, reportFile, outputFile = dataFile] = process.argv.slice(2);
if (!dataFile || !reportFile) throw new Error('Usage: import_manual_report.mjs <data.js> <verified-report.json> [output.js]');
const source = fs.readFileSync(dataFile, 'utf8');
const assignment = source.match(/const DASHBOARD_DATA\s*=\s*(\{[\s\S]*\});?\s*$/);
if (!assignment) throw new Error('Invalid dashboard data format.');
const data = JSON.parse(assignment[1]);
const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const exactDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
if (report.source !== 'weedmaps' || report.listing !== 'Joyleaf Weed Dispensary') throw new Error('This importer only accepts the verified Joyleaf Weed Dispensary Weedmaps report.');
if (!exactDate(report.period?.start_date) || !exactDate(report.period?.end_date) || report.period.start_date > report.period.end_date) throw new Error('Exact valid reporting dates are required.');
const imported = new Date(report.imported_at);
if (!Number.isFinite(imported.getTime()) || imported.getTime() > Date.now() + 60000 || report.period.end_date > imported.toISOString().slice(0,10)) throw new Error('A valid actual import time after the report period is required.');
const expectedFields = { unique_shoppers:'Unique shoppers', orders:'Orders', gmv:'Order GMV', monthly_spend:'Total spend' };
if (!report.metrics || Object.keys(report.metrics).length !== 4 || Object.keys(report.metrics).some(key => !Object.hasOwn(expectedFields,key))) throw new Error('Only the four reviewed aggregate metrics are accepted.');
for (const [key,value] of Object.entries(report.metrics)) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || ((key === 'orders' || key === 'unique_shoppers') && !Number.isSafeInteger(value))) throw new Error(`Invalid aggregate ${key}.`);
}
const at = imported.toISOString();
const period = {start_date:report.period.start_date,end_date:report.period.end_date};
const previous = data.automation.source_status.weedmaps;
const metricStatus = {...previous.metric_status};
for (const [key,value] of Object.entries(report.metrics)) {
  data.weedmaps[key] = value;
  metricStatus[key] = {status:'stale',collection_method:'manual-export',imported_at:at,period,provider_field:expectedFields[key]};
}
data.automation.source_status.weedmaps = {
  ...previous, status:'stale', source_label:'Weedmaps · Joyleaf Weed Dispensary · imported CSV', period,
  reason:'Dated manual report only; no automatic Weedmaps feed. Legacy click and delivery metrics remain historical.',
  manual_import:{imported_at:at,period,listing:report.listing,period_basis:'Report filename',metrics:{...report.metrics}},
  metric_status:metricStatus
};
// Do not alter any provider's successful refresh time, global refresh time, or another source's values.
fs.writeFileSync(outputFile,source.slice(0,assignment.index)+`const DASHBOARD_DATA = ${JSON.stringify(data,null,2)};\n`);
console.log(JSON.stringify({source:'weedmaps',collection_method:'manual-export',period,metrics:report.metrics}));
