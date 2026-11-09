// Standalone regression checks: node .github/scripts/dashboard-ui.test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const functions = ['ageStatus','periodText','sourceFreshness','metricText','titleCase','escapeHtml','metricValue'].map(name => {
 const start = script.indexOf(`function ${name}(`);
 let brace = script.indexOf('{', start), depth = 1, i = brace + 1;
 // Functions in this set have no unbalanced braces in string literals.
 for (; depth; i++) { if(script[i] === '{') depth++; if(script[i] === '}') depth--; }
 return script.slice(start, i);
}).join('\n');
const now = Date.now();
const recent = new Date(now - 3600000).toISOString();
const old = new Date(now - 37 * 3600000).toISOString();
const ctx = {Date, D:{google:{phone_calls:0}}, sourceStatuses:{google:{status:'partial',last_success:recent,period:{label:'Google period'},metric_status:{searches:{status:'fresh',last_success:recent,period:{start_date:'2026-10-01',end_date:'2026-10-28'}},photo_views:{status:'stale',last_success:old,period:{label:'Older period'}}}}}};
vm.createContext(ctx);vm.runInContext(functions,ctx);
assert.equal(ctx.ageStatus('fresh',recent),'fresh');
assert.equal(ctx.ageStatus('partial',recent),'partial');
assert.equal(ctx.ageStatus('fresh',old),'stale');
assert.equal(ctx.ageStatus('fresh',undefined),'stale');
assert.equal(ctx.ageStatus('fresh',new Date(now+3600000).toISOString()),'stale');
assert.equal(ctx.sourceFreshness('google'),'partial');
assert.equal(ctx.sourceFreshness('instagram'),'stale');
assert.match(ctx.metricText('google','searches'),/^fresh · 2026-10-01 to 2026-10-28/);
assert.match(ctx.metricText('google','photo_views'),/^stale · Older period/);
assert.match(ctx.metricText('google','phone_calls'),/^Retained \/ unverified/);
ctx.sourceStatuses.google.metric_status.phone_calls = {status:'invalid',reason:'Prior parser output is not valid provider data.'};
assert.equal(ctx.metricValue('google','phone_calls'),null);
assert.match(ctx.metricText('google','phone_calls'),/^Unavailable/);
assert.equal(ctx.periodText(), 'Period not recorded');
assert.equal(ctx.escapeHtml('<script>'), '&lt;script&gt;');
assert.ok(!script.includes('D.period'));
assert.ok(!script.includes('new Chart('));
assert.ok(html.includes('GitHub Actions runs a daily refresh'));
assert.ok(!html.includes('This gap is why Budzooka'));
assert.ok(!html.includes('organic new customer acquisition'));
assert.ok(html.includes("cache: 'no-store'"));
assert.ok(html.includes('Data unavailable'));
assert.ok(!html.includes('<script src="data.js">'));

console.log('UI freshness regression: 22 assertions passed; renderer syntax valid.');
