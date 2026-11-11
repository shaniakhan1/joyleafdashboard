#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {reportingPeriod} from './metrics.mjs';
const account = '17841462104093765';
// Windsor data_fetched_at is returned as a UTC wall-clock ISO string without an offset.
const providerTime = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value) ? new Date(value+'Z') : new Date(value);
const fields = {views:'media_views',engagements:'media_engagement',shares:'media_shares',reach:'media_reach',likes:'media_like_count',comments:'media_comments_count',saves:'media_saved'};
const number = value => (typeof value === 'number' || (typeof value === 'string' && value.trim())) && Number.isSafeInteger(Number(value)) && Number(value)>=0 ? Number(value) : undefined;
const text = (value,limit) => typeof value === 'string' ? Array.from(value.replace(/\s+/g,' ').trim()).slice(0,limit).join('') : '';
function safePostUrl(value) {
 let url;try {url=new URL(value);}catch {throw new Error('Instagram post link is invalid.');}
 if(url.protocol!=='https:' || !['instagram.com','www.instagram.com'].includes(url.hostname) || url.username || url.password || url.port || url.search || url.hash || !/^\/(?:p|reel)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) throw new Error('Instagram post link is not a safe permanent link.');
 return url.href;
}
export function buildInstagramContent(input) {
 const collected=new Date(input.collected_at);
 if(!Number.isFinite(collected.getTime()) || collected.getTime()>Date.now()+60000) throw new Error('A valid actual collection timestamp is required.');
 const period=reportingPeriod(collected);
 if(input.date_from!==period.start_date || input.date_to!==period.end_date) throw new Error('Content query must cover the 28 completed publication days ending yesterday.');
 const result=input.result;
 if(result?.status!=='done' || !Array.isArray(result.data) || result.total_rows!==result.data.length) throw new Error('Instagram content result is incomplete.');
 const seen=new Set();
 const posts=result.data.map(row=>{
  if(String(row.account_id)!==account || row.media_relationship!=='owned') throw new Error('Content response contains another account or unowned post.');
  const id=String(row.media_id||'');if(!/^\d+$/.test(id) || seen.has(id)) throw new Error('Content response has an invalid or duplicate post ID.');seen.add(id);
  const published=new Date(row.timestamp), fetched=providerTime(row.data_fetched_at);
  const date=typeof row.date==='string'?row.date.slice(0,10):'';
  if(!Number.isFinite(published.getTime()) || date!==published.toISOString().slice(0,10) || date<period.start_date || date>period.end_date) throw new Error('Content publication date falls outside the verified query window.');
  if(!Number.isFinite(fetched.getTime()) || fetched.getTime()>collected.getTime()+60000 || fetched.getTime()<published.getTime()) throw new Error('Content fetch timestamp is invalid.');
  const metrics={};for(const [key,field] of Object.entries(fields)){const n=number(row[field]);if(n!==undefined)metrics[key]=n;}
  if(metrics.views===undefined) throw new Error('A post is missing a valid view count; a complete view ranking cannot be established.');
  const format=String(row.media_type).toUpperCase().includes('REEL')||String(row.media_product_type).toUpperCase().includes('REEL')?'Reel':String(row.media_type)==='CAROUSEL_ALBUM'?'Carousel':String(row.media_type)==='VIDEO'?'Video':'Image';
  const caption=text(row.media_caption,220);const title=text(caption.split(/(?<=[.!?])\s/)[0],85)||`${format} · ${date}`;
  return {id,url:safePostUrl(row.media_permalink),published_at:published.toISOString(),published_date:date,format,title,caption,metrics,provider_fetched_at:fetched.toISOString()};
 });
 posts.sort((a,b)=>b.metrics.views-a.metrics.views || (b.metrics.engagements??-1)-(a.metrics.engagements??-1) || a.id.localeCompare(b.id));
 const topReel=posts.find(p=>p.format==='Reel');const mostShared=[...posts].filter(p=>p.metrics.shares!==undefined).sort((a,b)=>b.metrics.shares-a.metrics.shares || b.metrics.views-a.metrics.views)[0];
 const dataTime=posts.length?posts.map(p=>p.provider_fetched_at).sort()[0]:collected.toISOString();
 const items=posts.slice(0,5).map(p=>({id:p.id,title:p.title,caption:p.caption,url:p.url,published_at:p.published_at,format:p.format,badges:[...(topReel?.id===p.id?['Top reel']:[]),...(mostShared?.id===p.id && mostShared.metrics.shares>0?['Most shared']:[])],metrics:[{label:'Lifetime views',value:p.metrics.views},...(p.metrics.engagements!==undefined?[{label:'Engagements',value:p.metrics.engagements}]:[]),...(p.metrics.shares!==undefined?[{label:'Shares',value:p.metrics.shares}]:[])],provider_fetched_at:p.provider_fetched_at}));
 return {status:'fresh',source:'Windsor.ai · Joyleaf Instagram',collected_at:dataTime,imported_at:collected.toISOString(),publication_period:period,groups:posts.length?[{platform:'Instagram',label:'Top Instagram content',scope:`Published ${period.start_date} to ${period.end_date} · Ranked by lifetime views`,coverage:`Top ${items.length} of ${posts.length} owned posts returned. Older posts have had longer to accumulate views.`,ranking_metric:'media_views',corpus_size:posts.length,items}]:[]};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const [dataFile,inputFile,outputFile=dataFile]=process.argv.slice(2);
 if(!dataFile||!inputFile)throw new Error('Usage: import_instagram_content.mjs <data.js> <provider-content.json> [output.js]');
 const source=fs.readFileSync(dataFile,'utf8'),match=source.match(/const DASHBOARD_DATA\s*=\s*(\{[\s\S]*\});?\s*$/);
 if(!match)throw new Error('Invalid dashboard data file.');
 const data=JSON.parse(match[1]),input=JSON.parse(fs.readFileSync(inputFile,'utf8'));
 try {data.top_content=buildInstagramContent(input);}catch(error){data.top_content={...(data.top_content||{groups:[]}),status:'stale',last_attempt:input.collected_at,reason:String(error.message).slice(0,180)};}
 fs.writeFileSync(outputFile,source.slice(0,match.index)+`const DASHBOARD_DATA = ${JSON.stringify(data,null,2)};\n`);
 console.log(JSON.stringify({status:data.top_content.status,groups:data.top_content.groups.length,collected_at:data.top_content.collected_at,reason:data.top_content.reason}));
}
