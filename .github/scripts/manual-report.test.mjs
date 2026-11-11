import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../..');
const parse=file=>JSON.parse(fs.readFileSync(file,'utf8').match(/const DASHBOARD_DATA\s*=\s*(\{[\s\S]*\});?\s*$/)[1]);
test('manual Weedmaps imports preserve periods and never claim live freshness, including after a daily run',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'joyleaf-manual-'));
 try {
  const input=path.join(dir,'report.json'), output=path.join(dir,'output.js'), payload=path.join(dir,'payload.json');
  const prior=parse(path.join(root,'data.js'));
  const report={source:'weedmaps',listing:'Joyleaf Weed Dispensary',imported_at:'2026-11-11T16:00:00Z',period:{start_date:'2026-10-01',end_date:'2026-10-31'},metrics:{unique_shoppers:315,orders:1,gmv:30.41,monthly_spend:595}};
  const run=()=>execFileSync(process.execPath,[path.join(import.meta.dirname,'import_manual_report.mjs'),path.join(root,'data.js'),input,output],{stdio:'pipe'});
  fs.writeFileSync(input,JSON.stringify(report));run();
  const next=parse(output);
  assert.deepEqual(next.google,prior.google);assert.deepEqual(next.leafly,prior.leafly);assert.deepEqual(next.automation.source_status.reviews,prior.automation.source_status.reviews);
  assert.equal(next.automation.last_success,prior.automation.last_success);assert.equal(next.automation.source_status.weedmaps.last_success,prior.automation.source_status.weedmaps.last_success);
  assert.equal(next.automation.source_status.weedmaps.status,'stale');assert.equal(next.weedmaps.gmv,30.41);assert.equal(next.weedmaps.listing_visitors,prior.weedmaps.listing_visitors);
  assert.equal(next.automation.source_status.weedmaps.metric_status.gmv.collection_method,'manual-export');
  fs.writeFileSync(payload,JSON.stringify({run:{requested_at:'2026-11-12T14:00:00Z'},sources:{weedmaps:{status:'unavailable',metrics:{}}},meta:{snapshot_only:true}}));
  execFileSync(process.execPath,[path.join(import.meta.dirname,'merge_dashboard_data.mjs'),output,payload,output]);
  const later=parse(output);
  assert.equal(later.weedmaps.unique_shoppers,315);assert.equal(later.automation.source_status.weedmaps.metric_status.unique_shoppers.collection_method,'manual-export');
  assert.equal(later.automation.source_status.weedmaps.manual_import.imported_at,'2026-11-11T16:00:00.000Z');
  for(const bad of [{...report,source:'leafly'},{...report,listing:'Joyleaf Delivery'},{...report,period:{start_date:'2026-10-01',end_date:'2026-10-32'}},{...report,metrics:{...report.metrics,orders:-1}},{...report,metrics:{...report.metrics,opportunity_gmv:15350.93}}]) {fs.writeFileSync(input,JSON.stringify(bad));assert.throws(run);}
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
