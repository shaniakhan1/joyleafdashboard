# Client dashboard content refresh

## Instagram top posts and Reels

Use the existing connected Windsor app and the user's Joyleaf account. No new API key, paid plan, or public media URL is required. Discover the connector, fields and options before querying.

- Connector: `instagram`
- Account: `17841462104093765`
- Date filter: 28 completed UTC calendar days ending yesterday. These are **publication dates**, not the dates on which each view happened.
- Option: `media_relationship: owned`
- Fields: `account_id,date,timestamp,data_fetched_at,media_id,media_permalink,media_caption,media_type,media_product_type,media_relationship,media_views,media_reach,media_engagement,media_reel_total_interactions,media_like_count,media_comments_count,media_saved,media_shares`
- Do not retrieve or persist signed media/CDN URLs, reviewer data, or credentials. Public owned post permalinks and captions are sufficient.

Pass the exact completed provider result, including `status`, `total_rows` and every `data` row, into this envelope:

```json
{"collected_at":"ACTUAL_IMPORT_TIME_ISO","date_from":"YYYY-MM-DD","date_to":"YYYY-MM-DD","result":{"status":"done","total_rows":0,"data":[]}}
```

Run `node .github/scripts/import_instagram_content.mjs data.js provider-content.json output.js` after the social aggregate importer. It validates account identity, owned relationship, unique IDs, dates, completeness, metrics and permanent links. It uses Windsor's per-row UTC `data_fetched_at` for content freshness, not the import time. Windsor currently returns that field without an offset; the importer normalizes this UTC representation explicitly. Missing optional metrics are omitted, never turned into zero.

The displayed cohort is the five highest-view posts returned in the publication window. Post metrics are cumulative lifetime snapshots. Do not call them views earned during the window, sum unique reach, or compare them with channel totals. Older posts have had more time to accumulate views. 'Most shared' and 'Top reel' are selected from the complete returned cohort, not just the five displayed posts. Facebook content is omitted until its metric accrual scope is verified.

On a query or validation failure, preserve the last valid content and its provider timestamp, mark `top_content.status` stale, and record the current attempt. Do not claim the old data refreshed. The client also ages content after 36 hours. If the provider returns a verified empty cohort, show no empty content cards.

Publish the merged `data.js` once, against the latest branch head with an expected-SHA lease, preserving concurrent changes to all other sources, reports and benchmark data. If the branch moved, rebase the imports onto the new data before publishing. Verify the final public deployment and both social and content timestamps. Report failed sources or publication; never log raw provider messages or credential-bearing URLs.

## Google review benchmark

`review_benchmark` contains a dated manual public Google Maps snapshot of four selected local peers. Joyleaf's own rating/count comes from the independently refreshed owner API. It is a review-volume comparison, not a search rank or exhaustive market ranking.

Preserve `collected_at` until all four exact listings are reverified. On a scheduled check, open each stored Google Maps CID URL using authorized read-only access, match the business/address, and record only aggregate star rating/count. Do not scrape reviewer identities or accept permissions/login without authorization. If any listing cannot be verified, retain its original evidence and dates rather than refreshing the entire capture date. The current all-at-once schema should only be replaced after all four peers are verified in one check.

Current peer addresses: Budzooka, 142 Broad St, Elizabeth; Ayr, 2536 US-22, Union; Botera, 2290 US-22, Union; Breakwater, 154 Westfield Ave W, Roselle Park. All are New Jersey businesses. Breakwater now serves both recreational and medical customers.

## Other sections

The October Weedmaps Value Analytics export remains a dated report; daily jobs must preserve its import provenance without calling it live. Leafly and Yelp are not public live feeds. ChatGPT, Claude and Gemini visibility needs a separately evidenced repeatable audit; generated dashboard commentary is not an AI search measurement. Do not restore unsupported AI ranks or Manus.

## AI answer presence baseline (November 11, 2026)

The `ai_search` object now holds a real, dated manual consumer-app baseline: three fixed nonbranded discovery questions and one separate branded website/address accuracy check. ChatGPT named Joyleaf in 3/3 discovery answers and linked its website in 2/3. Gemini Flash named Joyleaf and linked its website in 3/3. One ChatGPT mention was qualified as potentially independent, outside its verified shortlist; the qualification is preserved explicitly. Claude required sign-in and was not tested, with null counts rather than zero.

This is not a rank, audience estimate, traffic measure or continuous feed. The website links were explicitly requested. The logged-out ChatGPT and Gemini temporary-chat surfaces were different, and one response per prompt is a small sample. Future manual checks must retain exact prompts, timestamp, surface/model, one fresh conversation per prompt, per-answer outcomes and any qualifications. Counts must agree with the completed unique prompt checks. Keep the branded accuracy test separate from discovery counts. Do not let daily data refreshes change the baseline date or infer that automation is active. No paid monitoring tool or additional AI credential is configured by this baseline.

The client page omits operational source/configuration panels. Keep source health in the machine-readable data for maintenance, while retaining relevant reporting dates, delayed-value labels and short measurement notes beside the visible metrics. Raw responses, account details and private chat/session links are not published.

Later on November 11, the user completed Claude sign-in and the same four prompts were tested in fresh incognito conversations using Sonnet 5.5 Medium. Claude named Joyleaf in 3/3 discovery answers and linked its website in 1/3. Two mentions were qualified: local service or independent ownership was not confirmed. Its separate website/address answer matched the official-site reference, but Claude relied on secondhand sources rather than opening Joyleaf's site. The Claude engine retains its actual collection timestamp; the original ChatGPT/Gemini records and original prompt set were preserved. All three assistants are now measured for this dated baseline, with no claim that the result is a ranking or a recurring feed.
