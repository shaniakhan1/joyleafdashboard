const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const script=fs.readFileSync('flp-one.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.includes('<script src="flp-one.js"></script>'),'FLP ONE must load before dashboard script');
assert.ok(html.includes('window.FLPOne.render(D,now)'),'render hook absent');
assert.ok(html.includes('window.FLPOne.attach(root)'),'attachment absent');
assert.ok(html.includes('href="#flp-one"'),'navigation absent');
const window={};
const context={window,localStorage:{getItem:()=>null},Date,Number,String,JSON,Math};
vm.createContext(context);
vm.runInContext(script,context);
const valid=(value, source='fresh', stamp='2026-11-19T12:00:00Z')=>({status:source,last_success:stamp,period:{start_date:'2026-10-22',end_date:'2026-11-18'}});
const data={automation:{source_status:{
 google:{metric_status:{searches:valid(),website_clicks:valid(),direction_requests:valid(),phone_calls:valid()}},
 instagram:{metric_status:{views:valid(),interactions:valid(),new_follows:valid()}},
 reviews:{metric_status:{rating:valid(),joyleaf_count:valid()}},
 facebook:{metric_status:{views:valid(),page_visits:valid(),interactions:valid()}}
}},google:{searches:19848,website_clicks:5338,direction_requests:1462,phone_calls:215},instagram:{views:27732,interactions:845,new_follows:61},reviews:{rating:4.9,joyleaf_count:3265},facebook:{views:4880,page_visits:479,interactions:128}};
const now=Date.parse('2026-11-19T18:00:00Z');
const findings=window.FLPOne.find(data,now);
assert.equal(findings.length,4);
assert.ok(findings.every(f=>f.status==='ready'));
assert.ok(window.FLPOne.render(data,now).includes('19848'.replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,')));
assert.ok(!window.FLPOne.render({automation:{source_status:{}}},now).includes('19848'));
data.automation.source_status.google.metric_status.searches=valid('stale','2026-07-01T00:00:00Z');
assert.equal(window.FLPOne.find(data,now)[0].status,'verify');
data.google.searches=null;
assert.equal(window.FLPOne.find(data,now)[0].status,'verify');
console.log('FLP ONE smoke tests passed');
