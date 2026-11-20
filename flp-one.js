(function (root) {
'use strict';
const STORE = 'flp-one-joyleaf-review-v1';
const HOUR = 3600000;
const html = value => String(value == null ? '' : value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const date = value => { const d = new Date(value); return Number.isFinite(d.getTime()) ? d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}) : 'Not recorded'; };
const period = value => value && (value.start_date && value.end_date ? value.start_date + ' to ' + value.end_date : value.label) || 'Period unknown';
const number = v => typeof v === 'number' && Number.isFinite(v) ? v.toLocaleString('en-US') : 'Unavailable';
function metricLabel(D, source, key) {
  const field = D.automation?.source_status?.[source]?.metric_status?.[key]?.provider_field;
  if (source === 'google' && key === 'searches') return 'Search & Maps impressions';
  if (source === 'facebook' && key === 'views') return field === 'page_impressions' ? 'Content impressions' : 'Views (legacy baseline)';
  if (source === 'facebook' && key === 'interactions') return field === 'page_post_engagements' ? 'Post engagements' : 'Interactions (legacy baseline)';
  if (source === 'reviews' && key === 'rating') return 'Google rating';
  return key.replace(/_/g, ' ');
}
function evidence(D, source, key, now) {
  const info = D.automation && D.automation.source_status && D.automation.source_status[source] && D.automation.source_status[source].metric_status && D.automation.source_status[source].metric_status[key];
  const raw = D[source] && D[source][key];
  if (!info || typeof raw !== 'number' || !Number.isFinite(raw) || info.status === 'invalid') return null;
  const last = info.collection_method === 'manual-export' ? info.imported_at : info.last_success;
  const stamp = Date.parse(last);
  if (!Number.isFinite(stamp) || !info.period || period(info.period)==='Period unknown') return null;
  return {value: raw, date:last, label:period(info.period), fresh: info.collection_method !== 'manual-export' && ['fresh','partial'].includes(info.status) && stamp<=now && now-stamp<36*HOUR, source, key, imported:info.collection_method==='manual-export'};
}
function find(D, now) {
  const get = (a,b)=>evidence(D,a,b,now), out = [];
  function add(key, priority, title, metrics, insight, action, measure) {
    const found = metrics.map(x=>get(x[0],x[1]));
    const available = found.filter(Boolean);
    if (!available.length) return;
    const status = available.length===metrics.length && available.every(x=>x.fresh) ? 'ready' : 'verify';
    out.push({key,priority,title,metrics:available,status,insight,action,measure});
  }
  add('local-discovery',1,'Connect local discovery to useful actions',
    [['google','searches'],['google','website_clicks'],['google','direction_requests'],['google','phone_calls']],
    'Google profile activity is measurable, but website clicks, calls and directions are signals of interest, not confirmed visits or sales.',
    'Compare consistent date ranges and validate which customer actions can be linked to store-level reporting. Do not infer conversion from unrelated totals.',
    'Weekly verified profile actions, recorded separately');
  add('content-effectiveness',2,'Find which posts earn meaningful attention',
    [['instagram','views'],['instagram','interactions'],['instagram','new_follows']],
    'Platform-level engagement is measurable, but it does not demonstrate that viewers became customers.',
    'Review date-aligned post-level data and classify non-promotional content themes. Compare profile actions where available.',
    'Date-aligned engagements and profile actions by content theme');
  add('review-experience',3,'Protect the customer experience',
    [['reviews','rating'],['reviews','joyleaf_count']],
    'Rating and review count are useful snapshots. Without a matched earlier snapshot, their change cannot be established.',
    'Check recent public feedback for recurring service issues, verify the source and prepare thoughtful owner responses for approval.',
    'New verified reviews, response coverage and recurring service themes');
  add('facebook-touchpoints',4,'Understand Facebook content and page activity',
    [['facebook','views'],['facebook','page_visits'],['facebook','interactions']],
    'Content impressions and page visits measure different behaviors; legacy view totals may use a different definition. These totals are not a customer conversion funnel.',
    'Compare consistent reporting windows and investigate which content leads to genuine page activity.',
    'Verified weekly page visits and post interactions');
  return out;
}
function load() {try {const s = JSON.parse(localStorage.getItem(STORE));return s && typeof s==='object' ? s : {};} catch {return {};}}
function save(s) {try {localStorage.setItem(STORE,JSON.stringify(s));return true;} catch {return false;}}
function render(D,now=Date.now()) {
  const signals=find(D,now), saved=load();
  const cards=signals.map(s=>{
    const record=saved[s.key] || {}, state=['To review','Approved','In progress','Completed'].includes(record.status)?record.status:'To review';
    const ev=s.metrics.map(m=>'<div class="flp-evidence"><strong>'+html(number(m.value))+'</strong><span>'+html(metricLabel(D,m.source,m.key))+'</span><small>'+html(m.label)+' · '+html(date(m.date))+'</small></div>').join('');
    return '<article class="flp-card"><div class="flp-card-top"><div><span class="flp-eyebrow">INVESTIGATION '+String(s.priority).padStart(2,'0')+'</span><h3>'+html(s.title)+'</h3></div><span class="flp-chip '+(s.status==='ready'?'is-current':'is-review')+'">'+(s.status==='ready'?'Recently retrieved':'Check source dates')+'</span></div><div class="flp-metrics">'+ev+'</div><p>'+html(s.insight)+'</p><div class="flp-action"><b>Next action</b><p>'+html(s.action)+'</p><small><b>Measure:</b> '+html(s.measure)+'</small></div><div class="flp-controls"><label for="flp-status-'+html(s.key)+'">Your local review status</label><select id="flp-status-'+html(s.key)+'" data-flp-status="'+html(s.key)+'"><option'+(state==='To review'?' selected':'')+'>To review</option><option'+(state==='Approved'?' selected':'')+'>Approved</option><option'+(state==='In progress'?' selected':'')+'>In progress</option><option'+(state==='Completed'?' selected':'')+'>Completed</option></select><label for="flp-note-'+html(s.key)+'">Outcome notes</label><textarea id="flp-note-'+html(s.key)+'" data-flp-note="'+html(s.key)+'" maxlength="500" placeholder="Who acted? When? What changed?">'+html(record.note||'')+'</textarea><button type="button" data-flp-save="'+html(s.key)+'">Save on this device</button><span class="flp-saved" data-flp-saved="'+html(s.key)+'" aria-live="polite"></span></div></article>';
  }).join('');
  return '<section id="flp-one" class="flp-section" aria-labelledby="flp-one-title"><div class="section-heading flp-heading"><div><span class="flp-eyebrow">FLP MARKETING GROUP / INTELLIGENCE ENGINE</span><h2 id="flp-one-title">FLP ONE</h2><p>From recorded performance to the next decision.</p></div><span class="pill">Pilot · Source-aware</span></div><div class="flp-intro"><strong>'+signals.length+' grounded investigations</strong><p>Built from the latest available dashboard data. Not a generative AI diagnosis. Each metric shows its own reporting period and collection date; older information is never described as a current result. These opportunities are starting points for a person to investigate, not evidence of causation.</p><p><a href="https://flp-one-pilot.shania490175.chatgpt.site" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Open private FLP ONE test</a> (owner access required; opens in a new tab)</p></div><div class="flp-grid">'+(cards || '<p class="flp-empty">Not enough verified data to form an investigation. No results have been invented.</p>')+'</div><div class="flp-footer"><div><b>Keep a record of what actually worked.</b><p>Review statuses and notes remain on this device only. They are not shared with Joyleaf or FLP staff, and do not approve publishing, advertising or any changes to external accounts.</p></div><button type="button" id="flp-export">Export local action log</button></div></section>';
}
function attach(rootEl) {
 if(!rootEl || rootEl.dataset.flpAttached==='1')return;
 rootEl.dataset.flpAttached='1';
 rootEl.addEventListener('click', event=>{
   const button=event.target.closest('button[data-flp-save]');
   if(button){
     const key=button.getAttribute('data-flp-save'), box=button.closest('.flp-card'), status=box.querySelector('[data-flp-status]').value, note=box.querySelector('[data-flp-note]').value.slice(0,500), data=load();
     data[key]={status,note,updated_at:new Date().toISOString()};
     const ok=save(data);
     box.querySelector('[data-flp-saved]').textContent=ok?'Saved locally':'Local storage unavailable';
   }
   if(event.target.closest('#flp-export')){
     const entries=load(), file=new Blob([JSON.stringify({product:'FLP ONE',pilot:'Joyleaf',scope:'Device-only review log, not shared approvals or verified business impact',exported_at:new Date().toISOString(),entries},null,2)],{type:'application/json'});
     const url=URL.createObjectURL(file), a=document.createElement('a');a.href=url;a.download='flp-one-joyleaf-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   }
 });
}
root.FLPOne={render,attach,find,evidence};
})(window);
