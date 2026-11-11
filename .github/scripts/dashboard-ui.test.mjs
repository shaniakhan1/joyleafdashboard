// Pure-renderer and bootstrap regression checks: node --test .github/scripts/dashboard-ui.test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const html = fs.readFileSync(new URL('../../index.html', import.meta.url),'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const pureScript = script.split('// Bootstrap is kept separate')[0];
const context = vm.createContext({Date,URL});
vm.runInContext(pureScript,context);
const now = Date.parse('2026-11-12T00:00:00Z');
const recent = new Date(now - 3600000).toISOString();
const old = new Date(now - 37 * 3600000).toISOString();
const period = {start_date:'2026-10-14',end_date:'2026-11-10'};
// Stable evidence fixture: daily production data must not change unit-test expectations.
const data = JSON.parse(fs.readFileSync(new URL('./fixtures/client-report.json',import.meta.url),'utf8'));
const fixture = () => JSON.parse(JSON.stringify(data));
const metric = (status='fresh',time=recent) => ({status,last_success:time,period});

test('renderer parses as JavaScript and static page remains failure safe',() => {
  new vm.Script(script);
  assert.ok(html.includes('aria-busy="true"'));
  assert.ok(html.includes('<noscript>'));
  assert.ok(!html.includes('<script src="data.js">'));
  assert.ok(html.includes("cache: 'no-store'"));
  assert.ok(html.includes('Data unavailable'));
  assert.ok(!script.includes('eval('));
});

test('the original supplied Joyleaf logo and its exact colors define the brand',() => {
  const logo=fs.readFileSync(new URL('../../assets/joyleaf-logo.png',import.meta.url));
  assert.equal(createHash('sha256').update(logo).digest('hex'),'0638a20575fdb9a2fd70c1a86e4c91efedfbb1370a15b9dc18c8bea8c118b6c6');
  assert.match(html,/<img class="brand-logo" src="assets\/joyleaf-logo\.png" alt="Joyleaf" width="60" height="60"/);
  assert.ok(html.includes('--purple:#954098;--cream:#f7eee2;'));
  assert.ok(html.includes('--paper:var(--cream)'));
  assert.ok(!html.includes('class="brand-mark"'));
  assert.ok(html.includes('Prepared by <strong>FLP Marketing Group</strong>'));
});

test('brand typography has resilient fallbacks and readable primary color contrast',() => {
  assert.ok(html.includes('family=Outfit:wght@400;500;600;700&display=swap'));
  assert.match(html,/h1,h2,h3\{[^}]*font-family:Outfit,'DM Sans',Arial,sans-serif/);
  assert.match(html,/\.brand-logo\{[^}]*width:60px;height:60px;object-fit:contain/);
  assert.match(html,/@media\(max-width:560px\)[\s\S]*\.brand-logo\{width:48px;height:48px\}/);
  const luminance=hex=>hex.match(/[a-f\d]{2}/gi).map(part=>parseInt(part,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
  const contrast=(first,second)=>(Math.max(luminance(first),luminance(second))+.05)/(Math.min(luminance(first),luminance(second))+.05);
  assert.ok(contrast('954098','f7eee2')>=4.5);
  assert.ok(contrast('716878','f7eee2')>=4.5);
});

test('source links use dependable vector arrows and accessible new-tab labels',() => {
  assert.ok(!html.includes('↗'));
  const content={status:'fresh',collected_at:recent,groups:[{platform:'instagram',items:[{title:'Verified post',url:'https://www.instagram.com/p/verified/',metrics:[]}]}]};
  const rendered=context.renderTopContent(content,now);
  assert.match(rendered,/<svg class="external-link-icon"[^>]*aria-hidden="true" focusable="false">/);
  assert.ok(rendered.includes('<span class="sr-only"> (opens in a new tab)</span>'));
  const benchmark=context.renderReviewBenchmark(benchmarkFixture(),now);
  assert.equal((benchmark.match(/class="external-link-icon"/g)||[]).length,4);
  assert.equal((benchmark.match(/\(opens in a new tab\)/g)||[]).length,4);
});

test('automatic evidence expires after 36 hours, including future or missing timestamps',() => {
  assert.equal(context.ageStatus('fresh',recent,now),'fresh');
  assert.equal(context.ageStatus('partial',recent,now),'partial');
  assert.equal(context.ageStatus('fresh',old,now),'stale');
  assert.equal(context.ageStatus('fresh',undefined,now),'stale');
  assert.equal(context.ageStatus('fresh',new Date(now+3600000).toISOString(),now),'stale');
  assert.equal(context.ageStatus('failed',recent,now),'stale');
  assert.equal(context.ageStatus('fresh',new Date(now-36*3600000).toISOString(),now),'stale');
});

test('exact source and field dates take priority over global period labels',() => {
  assert.equal(context.periodText(period),'2026-10-14 to 2026-11-10');
  assert.equal(context.periodText({label:'Current snapshot 2026-11-11'}),'Current snapshot 2026-11-11');
  assert.equal(context.periodText(),'Period not recorded');
  const d=fixture();d.period={label:'DO NOT DISPLAY THIS PERIOD'};
  const rendered=context.createDashboard(d,now);
  assert.ok(!rendered.includes('DO NOT DISPLAY THIS PERIOD'));
  assert.ok(rendered.includes('2026-10-12 to 2026-11-08'));
  assert.ok(rendered.includes('Current snapshot 2026-11-11'));
});

test('real zero values render while invalid and unverified baselines do not',() => {
  const d=fixture();d.google.phone_calls=0;
  d.automation.source_status.google.metric_status.phone_calls=metric();
  assert.equal(context.metricValue(d,'google','phone_calls'),0);
  assert.match(context.createDashboard(d,now),/data-metric="google.phone_calls"><div class="metric-value">0<\/div>/);
  d.automation.source_status.google.metric_status.phone_calls.status='invalid';
  assert.equal(context.metricValue(d,'google','phone_calls'),null);
  delete d.automation.source_status.google.metric_status.phone_calls;
  assert.equal(context.metricValue(d,'google','phone_calls'),null);
  d.automation.source_status.google.metric_status.phone_calls={status:'stale',period};
  assert.equal(context.metricValue(d,'google','phone_calls'),null);
});

test('metric values require numbers, dates and recorded provenance',() => {
  const d=fixture();const meta=d.automation.source_status.google.metric_status;
  meta.phone_calls=metric();d.google.phone_calls='0';
  assert.equal(context.metricValue(d,'google','phone_calls'),null);
  d.google.phone_calls=Infinity;assert.equal(context.metricValue(d,'google','phone_calls'),null);
  d.google.phone_calls=0;delete meta.phone_calls.period;
  assert.equal(context.metricValue(d,'google','phone_calls'),null);
});

test('a stale automatic feed retains its verified value with a visible delayed label',() => {
  const d=fixture();d.google.phone_calls=218;
  d.automation.source_status.google.metric_status.phone_calls=metric('stale',old);
  const rendered=context.createDashboard(d,now);
  assert.match(rendered,/data-metric="google.phone_calls"><div class="metric-value">218<\/div>[\s\S]*?Last verified value/);
  assert.match(context.metricText('google','phone_calls',d.automation.source_status,now),/^Last recorded/);
});

test('Facebook and LinkedIn metric semantics survive expiry',() => {
  const statuses={facebook:{metric_status:{views:{...metric('stale',old),provider_field:'page_impressions'},interactions:{...metric('stale',old),provider_field:'page_post_engagements'}}},linkedin:{metric_status:{reactions:{...metric('stale',old),provider_field:'account_analytics_like_count'}}}};
  assert.equal(context.metricLabel('facebook','views',statuses),'Content impressions');
  assert.equal(context.metricLabel('facebook','interactions',statuses),'Post engagements');
  assert.equal(context.metricLabel('linkedin','reactions',statuses),'Likes');
  assert.match(context.metricText('linkedin','reactions',statuses,now),/2026-10-14 to 2026-11-10/);
  const rendered=context.createDashboard(fixture(),now);
  assert.ok(rendered.includes('Content impressions'));
  assert.ok(rendered.includes('Post engagements'));
  assert.ok(rendered.includes('Likes'));
});

test('Google review rating and count use actual verified measurements',() => {
  const d=fixture();delete d.review_benchmark;d.reviews.rating=4.900000095367432;d.reviews.joyleaf_count=3220;
  const rendered=context.createDashboard(d,now);
  assert.match(rendered,/4.9<small> \/ 5<\/small>/);
  assert.match(rendered,/3,220 Google reviews/);
  assert.ok(!rendered.includes('Budzooka'));
  assert.ok(!rendered.includes('Breakwater'));
});

test('manual Weedmaps report remains imported after failed daily attempts',() => {
  const d=fixture();const fields={unique_shoppers:315,orders:1,gmv:30.41,monthly_spend:595};
  const reportPeriod={start_date:'2026-10-01',end_date:'2026-10-31'};
  d.weedmaps={...d.weedmaps,...fields};
  d.automation.source_status.weedmaps={status:'failed',last_attempt:recent,period:reportPeriod,manual_import:{imported_at:old,period:reportPeriod,metrics:fields},metric_status:Object.fromEntries(Object.keys(fields).map(key=>[key,{status:'stale',collection_method:'manual-export',imported_at:old,period:reportPeriod}]))};
  const statuses=d.automation.source_status;
  assert.equal(context.sourceFreshness('weedmaps',statuses,now),'imported report');
  assert.equal(context.metricValue(d,'weedmaps','gmv'),30.41);
  assert.match(context.metricText('weedmaps','gmv',statuses,now),/^Imported report · 2026-10-01 to 2026-10-31/);
  const rendered=context.createDashboard(d,now);
  assert.ok(rendered.includes('Weedmaps storefront'));
  assert.ok(rendered.includes('$30.41'));
  assert.ok(rendered.includes('$595.00'));
  assert.ok(rendered.includes('Unique shoppers'));
  assert.ok(rendered.includes('Storefront total spend'));
  assert.ok(rendered.includes('Storefront only. This report does not update automatically.'));
  assert.ok(rendered.includes('Modeled opportunity GMV is excluded.'));
});

test('no manual report means no retained Weedmaps metric card',() => {
  const d=fixture();delete d.automation.source_status.weedmaps.manual_import;
  assert.ok(!context.createDashboard(d,now).includes('Weedmaps storefront'));
});

test('AI baseline uses actual dated answer evidence for all three assistants',() => {
  const rendered=context.renderAiBaseline(fixture().ai_search,now);
  assert.match(rendered,/<section class="ai-section" id="ai-search"/);
  assert.ok(rendered.includes('Manual baseline · Checked Nov 11, 2026'));
  assert.equal((rendered.match(/class="ai-card"/g)||[]).length,3);
  assert.equal((rendered.match(/3 of 3<\/strong> tested answers named Joyleaf/g)||[]).length,3);
  assert.ok(rendered.includes('Website linked in 2 of 3 answers.'));
  assert.ok(rendered.includes('Website linked in 3 of 3 answers.'));
  assert.ok(rendered.includes('Website linked in 1 of 3 answers.'));
  assert.ok(!rendered.includes('Claude: not tested'));
  assert.ok(rendered.includes('Two mentions were qualified'));
  assert.ok(rendered.includes('Website and address details came from secondhand sources'));
  assert.ok(rendered.includes('Sonnet 5.5 Medium'));
  assert.ok(rendered.includes('independent ownership was not confirmed'));
  assert.ok(rendered.includes('Website links were explicitly requested.'));
  assert.ok(rendered.includes('These checks do not update automatically.'));
  assert.ok(!/manus/i.test(html));
  assert.ok(!rendered.includes('#1'));
  assert.ok(!rendered.includes('100%'));
});

test('AI answer counts must agree with all three unique completed prompt checks',() => {
  const d=fixture().ai_search;
  d.engines.find(x=>x.id==='chatgpt').brand_mentions=2;
  let rendered=context.renderAiBaseline(d,now);
  assert.equal((rendered.match(/class="ai-card"/g)||[]).length,2);
  d.engines.find(x=>x.id==='gemini').checks[1].prompt_id=d.engines.find(x=>x.id==='gemini').checks[0].prompt_id;
  d.engines.find(x=>x.id==='claude').collected_at='2099-01-01';
  assert.equal(context.renderAiBaseline(d,now),'');
  assert.equal(context.renderAiBaseline({...fixture().ai_search,collected_at:'2099-01-01'},now),'');
  assert.equal(context.renderAiBaseline(undefined,now),'');
});

test('AI method is escaped, dated and not falsely refreshed with daily feeds',() => {
  const d=fixture().ai_search;d.prompts[0].text='<img src=x onerror=alert(1)>';
  const rendered=context.renderAiBaseline(d,now+40*86400000);
  assert.ok(rendered.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!rendered.includes('<img src=x'));
  assert.ok(rendered.includes('Checked Nov 11, 2026'));
  assert.ok(rendered.includes('not a search ranking'));
});

test('unsupported metrics, raw errors, duplicate warnings and fabricated charts are absent',() => {
  const d=fixture();d.automation.source_status.google.reason='RAW_ERROR_SHOULD_STAY_PRIVATE';
  const rendered=context.createDashboard(d,now);
  for(const excluded of ['Comparison unavailable','Chart withheld','RAW_ERROR_SHOULD_STAY_PRIVATE','data-metric="google.photo_views"','data-metric="instagram.reach"','data-metric="leafly.','data-metric="yelp.','SEO Health Score','Content Delivery']) assert.ok(!rendered.includes(excluded),excluded);
  assert.ok(!html.includes('<canvas'));
  assert.ok(!script.includes('new Chart('));
  assert.ok(!rendered.includes('Sources & reporting details'));
  assert.ok(!rendered.includes('Last refresh attempt:'));
  assert.ok(!rendered.includes('Last successful refresh: 2026-'));
  assert.ok(!html.includes('href="#sources"'));
  assert.ok(rendered.includes('Dates are shown beside each measure.'));
  assert.ok(rendered.includes('Profile actions show customer interest. They are not confirmed store visits or sales.'));
});

test('top-content section stays hidden when no actual dataset exists',() => {
  assert.equal(context.renderTopContent(undefined),'');
  assert.equal(context.renderTopContent({groups:[]}),'');
  assert.equal(context.renderTopContent({groups:[{platform:'instagram',items:[]}]}),'');
});

test('verified content renders platform-specific scope, links, lifetime metrics and real zeros',() => {
  const content={status:'fresh',collected_at:recent,groups:[{platform:'Instagram',label:'Instagram',scope:'Top 5 of 20 posts published Oct 14–Nov 10, 2026, ranked by lifetime views.',coverage:'Lifetime metrics, not views during the reporting period.',items:Array.from({length:5},(_,i)=>({title:`Post ${i+1}`,url:`https://www.instagram.com/reel/verified${i}/`,published_at:'2026-10-20',format:'Reel',metrics:[{label:'Lifetime views',value:i===0?3970:0},{label:'Likes',value:0}]}))}]};
  const rendered=context.renderTopContent(content,now);
  assert.ok(rendered.includes('3,970'));
  assert.ok(rendered.includes('Lifetime views'));
  assert.ok(rendered.includes('Likes: 0'));
  assert.ok(rendered.includes('Top 5 of 20 posts'));
  assert.ok(rendered.includes('See all 5 posts'));
  assert.ok(rendered.includes('target="_blank" rel="noopener noreferrer"'));
  assert.equal((rendered.match(/class="post"/g)||[]).length,5);
});

test('content links are HTTPS source URLs only and all incoming text is escaped',() => {
  assert.equal(context.safeContentUrl('javascript:alert(1)','instagram'),'');
  assert.equal(context.safeContentUrl('https://instagram.com.evil.test/p/x','instagram'),'');
  assert.equal(context.safeContentUrl('https://facebook.com/l.php?u=https://example.org','facebook'),'');
  assert.equal(context.safeContentUrl('https://user:pass@instagram.com/reel/x','instagram'),'');
  assert.equal(context.safeContentUrl('https://www.facebook.com/posts/123','facebook'),'https://www.facebook.com/posts/123');
  assert.equal(context.safeContentUrl('https://instagram.com/p/abc','facebook'),'');
  const rendered=context.renderTopContent({collected_at:recent,groups:[{platform:'instagram',label:'<script>alert(1)</script>',scope:'<img src=x>',items:[{title:'<b>unsafe</b>',url:'javascript:alert(1)',metrics:[]}]}]});
  assert.ok(!rendered.includes('<script>'));
  assert.ok(!rendered.includes('href="javascript:'));
  assert.ok(rendered.includes('&lt;b&gt;unsafe&lt;/b&gt;'));
});

test('JSON-only data parsing rejects executable payloads and malformed records',() => {
  assert.throws(()=>context.parseDashboardData('const DASHBOARD_DATA = {"automation":{"source_status":{}}}; alert(1)'));
  assert.throws(()=>context.parseDashboardData('const DASHBOARD_DATA = {automation:{source_status:{}}};'));
  assert.throws(()=>context.parseDashboardData('const DASHBOARD_DATA = {"automation":{"source_status":[]}};'));
  assert.throws(()=>context.parseDashboardData('const DASHBOARD_DATA = {};'));
});

test('fetch failure displays a complete fallback instead of leftover metrics',async () => {
  const root={innerHTML:'initial',setAttribute(){}};
  const ctx=vm.createContext({Date,URL,fetch:async()=>({ok:false}),document:{getElementById:()=>root,querySelectorAll:()=>[]}});
  await vm.runInContext(script,ctx);
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(root.innerHTML.includes('Data unavailable'));
  assert.ok(root.innerHTML.includes('Reload dashboard'));
  assert.ok(!root.innerHTML.includes('data-kpi'));
});

test('successful bootstrap fetches uncached JSON and renders without a live API',async () => {
  const root={innerHTML:'',setAttribute(){}};let request;
  const ctx=vm.createContext({Date,URL,location:{hash:''},fetch:async(...args)=>{request=args;return {ok:true,text:async()=>`const DASHBOARD_DATA = ${JSON.stringify(fixture())};`};},document:{getElementById:id=>id==='dashboard'?root:null,querySelectorAll:()=>[]}});
  await vm.runInContext(script,ctx);
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(request[0],/^data\.js\?refresh=\d+$/);
  assert.equal(request[1].cache,'no-store');
  assert.ok(root.innerHTML.includes('Your marketing, at a glance.'));
});

test('content ages after 36 hours and failures keep the original dated snapshot',() => {
  const content={status:'fresh',collected_at:recent,groups:[{platform:'Instagram',items:[{title:'A verified Reel',format:'Reel',published_at:'2026-10-20',url:'https://www.instagram.com/reel/verified/',badges:['Top reel','Most shared','Unsupported claim'],metrics:[{label:'Lifetime views',value:3970}]}]}]};
  const fresh=context.renderTopContent(content,now);
  assert.ok(fresh.includes('Top-performing content'));
  assert.ok(fresh.includes('Metrics retrieved Nov 11, 2026.'));
  assert.ok(fresh.includes('class="post-badge">Top reel'));
  assert.ok(fresh.includes('class="post-badge">Most shared'));
  assert.ok(!fresh.includes('Unsupported claim'));
  for(const changed of [{...content,status:'failed'},{...content,status:'stale'},{...content,collected_at:old},{...content,collected_at:new Date(now-36*3600000).toISOString()}]){
    const rendered=context.renderTopContent(changed,now);
    assert.ok(rendered.includes('Content performance snapshot'));
    assert.ok(rendered.includes('Snapshot from '));
    assert.ok(rendered.includes('These results have not refreshed.'));
    assert.ok(!rendered.includes('The posts getting attention'));
  }
  const failure=context.renderTopContent({...content,status:'failed',last_attempt:new Date(now).toISOString()},now);
  assert.ok(failure.includes('Snapshot from Nov 11, 2026.'));
  assert.equal(context.renderTopContent({...content,collected_at:'invalid'},now),'');
});

const benchmarkFixture = () => {
  const d=fixture();
  d.review_benchmark={collected_at:'2026-11-11T16:44:40Z',peers:[
    {name:'Budzooka · Elizabeth',rating:5,review_count:6447,url:'https://maps.google.com/?cid=10489408539509163036'},
    {name:'Ayr · Union',rating:4.7,review_count:1440,url:'https://maps.google.com/?cid=4572311775065296294'},
    {name:'Botera · Union',rating:4.9,review_count:1213,url:'https://maps.google.com/?cid=12045809006380092120'},
    {name:'Breakwater · Roselle Park',rating:4.8,review_count:478,url:'https://maps.google.com/?cid=13732885580366226478'}
  ]};
  return d;
};

test('Google review benchmark links verified peers and never presents review order as search rank',() => {
  const d=benchmarkFixture();
  const rendered=context.renderReviewBenchmark(d,now);
  assert.ok(rendered.includes('Google review benchmark'));
  assert.ok(rendered.includes('Selected nearby dispensaries'));
  for(const value of ['6,447','3,220','1,440','1,213','478']) assert.ok(rendered.includes(value));
  for(const peer of d.review_benchmark.peers) assert.ok(rendered.includes(`href="${peer.url}"`));
  assert.ok(rendered.includes('Peer snapshots: Nov 11, 2026.'));
  assert.ok(rendered.includes('not Google search rankings'));
  assert.ok(!rendered.includes('#2'));
  assert.ok(!rendered.includes('in the market'));
  assert.ok(rendered.indexOf('Budzooka · Elizabeth') < rendered.indexOf('Joyleaf · Roselle'));
  assert.equal((rendered.match(/class="own-business"/g)||[]).length,1);
});

test('benchmark Joyleaf values and freshness come from the current review fields, never the peer snapshot',() => {
  const d=benchmarkFixture();d.reviews.joyleaf_count=4000;d.reviews.rating=4.8;
  for(const key of ['rating','joyleaf_count']) d.automation.source_status.reviews.metric_status[key]=metric('fresh',recent);
  const rendered=context.renderReviewBenchmark(d,now);
  assert.ok(rendered.includes('4,000'));
  assert.ok(!rendered.includes('3,220'));
  assert.match(rendered,/class="own-business"[\s\S]*?<td>4.8/);
  assert.ok(rendered.includes('Joyleaf: Nov 11, 2026 · updated daily'));
  d.automation.source_status.reviews.metric_status.joyleaf_count=metric('stale',old);
  const delayed=context.renderReviewBenchmark(d,now);
  assert.ok(delayed.includes('(last verified)'));
  assert.ok(delayed.includes('Peer snapshots: Nov 11, 2026.'));
});

test('benchmark missing or invalid evidence is hidden instead of creating placeholders',() => {
  const d=benchmarkFixture();delete d.review_benchmark;
  assert.equal(context.renderReviewBenchmark(d,now),'');
  d.review_benchmark={collected_at:recent,peers:[]};
  assert.equal(context.renderReviewBenchmark(d,now),'');
  const invalid=benchmarkFixture();delete invalid.automation.source_status.reviews.metric_status.rating;
  assert.equal(context.renderReviewBenchmark(invalid,now),'');
  const invalidPeers=benchmarkFixture();invalidPeers.review_benchmark.peers.forEach(peer=>peer.rating=6);
  assert.equal(context.renderReviewBenchmark(invalidPeers,now),'');
});

test('benchmark links are exact Google Maps CID URLs and peer names are escaped',() => {
  for(const url of ['javascript:alert(1)','https://maps.google.com.evil.test/?cid=123','https://maps.google.com/?cid=1&url=https://example.com','https://maps.google.com:444/?cid=1','https://maps.google.com/?cid=1&cid=2']) assert.equal(context.safeReviewUrl(url),'');
  const d=benchmarkFixture();d.review_benchmark.peers[0].name='<script>alert(1)</script>';
  d.review_benchmark.peers.push({...d.review_benchmark.peers[0]});
  const rendered=context.renderReviewBenchmark(d,now);
  assert.ok(rendered.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!rendered.includes('<script>'));
  assert.equal((rendered.match(/cid=10489408539509163036/g)||[]).length,1);
});

test('a blocked or future Claude check is not reported as zero or as a verified result',() => {
 const audit=fixture().ai_search,claude=audit.engines.find(engine=>engine.id==='claude');
 claude.status='blocked';claude.brand_mentions=null;claude.website_links=null;claude.checks=[];
 let rendered=context.renderAiBaseline(audit,now);
 assert.equal((rendered.match(/class="ai-card"/g)||[]).length,2);
 assert.ok(rendered.includes('Claude: not tested (sign-in required).'));
 assert.ok(!rendered.includes('0 of 3'));
 const future=fixture().ai_search;future.engines.find(engine=>engine.id==='claude').collected_at='2099-01-01';
 rendered=context.renderAiBaseline(future,now);
 assert.ok(rendered.includes('Claude: result not verified.'));
 assert.ok(!rendered.includes('Website linked in 1 of 3 answers.'));
});


test('current production data remains parseable and renderable without fixed dates or counts',() => {
 const production=context.parseDashboardData(fs.readFileSync(new URL('../../data.js',import.meta.url),'utf8'));
 const rendered=context.createDashboard(production,Date.now()+60000);
 assert.ok(rendered.includes('Your marketing, at a glance.'));
 assert.ok(!rendered.includes('Sources & reporting details'));
});
