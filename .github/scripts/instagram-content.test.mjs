import test from 'node:test';
import assert from 'node:assert/strict';
import {buildInstagramContent} from './import_instagram_content.mjs';
const row=(id,views,shares=0)=>({account_id:'17841462104093765',media_relationship:'owned',media_id:String(id),date:'2026-10-20',timestamp:'2026-10-20T14:00:00+0000',data_fetched_at:'2026-11-11T16:38:41Z',media_permalink:`https://www.instagram.com/reel/post_${id}/`,media_caption:'A public team post. Caption.',media_type:'REELS',media_views:views,media_engagement:5,media_shares:shares});
const input=rows=>({collected_at:'2026-11-11T16:40:00Z',date_from:'2026-10-14',date_to:'2026-11-10',result:{status:'done',total_rows:rows.length,data:rows}});
test('content ranks unique owned posts without summing snapshots and labels cumulative scope',()=>{
 const d=buildInstagramContent(input([row(1,100,2),row(2,500,1),row(3,200,9),row(4,0)]));
 assert.equal(d.collected_at,'2026-11-11T16:38:41.000Z');assert.equal(d.groups[0].corpus_size,4);assert.deepEqual(d.groups[0].items.map(x=>x.id),['2','3','1','4']);assert.match(d.groups[0].scope,/lifetime views/);assert.deepEqual(d.groups[0].items[0].badges,['Top reel']);assert.deepEqual(d.groups[0].items[1].badges,['Most shared']);assert.equal(d.groups[0].items[3].metrics[0].value,0);
});
test('content refuses wrong accounts, dates, duplicate IDs, incomplete data and unsafe links',()=>{
 const mutations=[r=>{r.account_id='other';},r=>{r.media_relationship='collaborative';},r=>{r.media_views=null;},r=>{r.media_permalink='https://instagram.com.evil.example/reel/a/';},r=>{r.media_permalink+='?access_token=secret';},r=>{r.date='2026-10-01';},r=>{r.data_fetched_at='2099-01-01';}];
 for(const mutate of mutations){const r=row(1,2);mutate(r);assert.throws(()=>buildInstagramContent(input([r])));}
 assert.throws(()=>buildInstagramContent(input([row(1,2),row(1,3)])));
 const missing=input([row(1,2)]);missing.result.total_rows=2;assert.throws(()=>buildInstagramContent(missing));
});
test('provider UTC timestamp without an offset does not depend on executor timezone',()=>{
 const r=row(1,4);r.data_fetched_at='2026-11-11T16:38:41';
 assert.equal(buildInstagramContent(input([r])).collected_at,'2026-11-11T16:38:41.000Z');
});
