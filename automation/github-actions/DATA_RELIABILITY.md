# Data reliability repair (2026-11-09)

- Provider refresh runs daily at 13:17 UTC, on manual dispatch, and on collector/workflow changes. GitHub schedules may be delayed. The generated AI insight remains weekly (Monday), or an explicitly manual refresh.
- Freshness expires after 36 hours in the client UI. Each provider and each metric has its own successful retrieval timestamp and reporting period. A successful Actions job does not imply all providers connected; check the run summary and dashboard source health.
- Google Performance response uses `multiDailyMetricTimeSeries[].dailyMetricTimeSeries[].timeSeries.datedValues[]`, with string-encoded integers. An omitted `value` on an actual dated point means zero per Google's reference. An absent series or empty response does not mean zero. Previously published Google zeros from the old parser are quarantined until replaced by a valid report.
- Google Performance is a rolling 28-day window ending three days before collection. The legacy `searches` key sums Search + Maps impressions, not unique searches or search queries. Photo views are unavailable from this endpoint.
- Google location selection requires the configured `GOOGLE_LOCATION_NAME`, or exactly one authorized profile titled Joyleaf Weed Dispensary (the storefront named by the dashboard). Multiple profiles are a blocker rather than an arbitrary selection.
- Google Reviews may use the existing Business Profile authorization to fetch the selected profile's aggregate rating and total count. No review text or reviewer identity is published. The Nov 9 production request received HTTP 403; automatic retries are paused until an authorized reporting source is configured. Competitor counts and rating distribution remain historical.
- YouTube reports a rolling 28-day window ending yesterday for the explicit Joyleaf channel; subscriber total is a current channel snapshot.
- Missing/failed providers retain values with explicit stale labels and keep last-success evidence. Unsupported percentage comparisons are cleared. Historical monthly arrays are never appended with rolling-window totals. New snapshots retain exact dates separately.
- SEO grades, ranking grids, content-delivery counts and AI-search audits are manual historical baselines, not API feeds. They are not relabelled with the current month.
- Instagram, Facebook and LinkedIn use Windsor.ai when WINDSOR_API_KEY is configured as an encrypted GitHub Actions repository secret. Account selection is pinned to the verified Joyleaf accounts; other agency accounts are never requested. Leafly, Weedmaps and Yelp still require authorized reporting sources. A successful job does not mean those missing feeds are live.

## Verification

Run `node --test .github/scripts/*.test.mjs` and `node --check .github/scripts/collect_live_metrics.mjs`. After deployment, check the exact GitHub Actions commit and inspect the published `data.js` source statuses. Do not mark missing integrations resolved just because the build is green.

Official Google response references:
- https://developers.google.com/my-business/reference/performance/rest/v1/locations/fetchMultiDailyMetricsTimeSeries
- https://developers.google.com/my-business/reference/performance/rest/v1/TimeSeries

## Verified production result

The Nov 9 refresh successfully returned Google storefront performance and YouTube analytics. Instagram, Facebook, LinkedIn, Leafly, Weedmaps and Yelp have no configured reporting endpoint. Google Reviews access is denied (HTTP 403). These are unresolved access/configuration blockers, not repaired connections.

## Windsor publishing bridge (2026-11-09)

- The existing Windsor connection returns Joyleaf Instagram (17841462104093765), Facebook (120224484515319), and LinkedIn (97213401). Only aggregate analytics are published.
- Instagram: views, total_interactions, follower_count_1d. Daily unique reach is not additive; 28-day reach and non-follower reach stay historical until a deduplicated period report exists.
- Facebook: page_impressions is labeled Content impressions (not video views); page_post_engagements is labeled Post engagements. Page visits and daily follows also refresh.
- LinkedIn: impression count and like count are additive; the latter is labeled Likes, not all reactions. organization_follower_count is fetched separately as a current snapshot.
- Daily totals require exactly one valid row per day for the selected account across all 28 completed days. Missing days, wrong accounts, duplicate rows, and invalid metrics are withheld.
- Per-metric metadata identifies the exact provider field and reporting window. Old percentage changes are cleared, and legacy monthly series are not rewritten.
- The server-side collector reads WINDSOR_API_KEY from the encrypted repository secret. It never writes the credential to data.js or logs. Windsor accepts query-parameter auth only; raw response/error text and request URLs are not logged, and redirects are blocked. Do not put the key in source code or the browser.
- One daily GitHub run is scheduled at 13:17 UTC. Upstream processing/caching and reporting lag still apply; this is not a real-time view of same-day activity. No hourly-plan upgrade or paid destination is configured.
- The Nov 9 connected-plugin read verified 28 complete days (Oct 12–Nov 8): Instagram 27,059 views / 776 interactions / 76 new follows; Facebook 4,883 content impressions / 112 post engagements / 481 page visits / 2 new follows; LinkedIn 945 impressions / 32 likes, plus 705 current followers. This read validates mappings, not yet the unattended GitHub credential setup.

Official Windsor API reference: https://windsor.ai/api-documentation/

## Connected-app publishing (2026-11-11)

The social publishing route uses the user's existing connected Windsor and GitHub apps. No new API credential is required or stored. `import_windsor_snapshot.mjs` converts the exact provider rows into dashboard metrics; it checks account identity, calendar dates, complete daily coverage, and numeric validity. Missing sources become stale without overwriting last-known good values or last-success timestamps.

The independent social refresh task is scheduled daily at 8:00 a.m. America/Chicago, starting November 12, 2026. Existing GitHub Actions still refresh Google and YouTube; they preserve `managed_by: windsor-connected-app` source metadata rather than falsely marking a successful social import as missing configuration. The browser expires freshness after 36 hours regardless of which runner publishes a source. A successful social snapshot is not proof that a future scheduled run will execute.

Input schema for the importer is `{collected_at: actual ISO timestamp, sources: {instagram, facebook, linkedin, linkedin_followers}}`. Each source is the exact connected Windsor result `{status: "done", data: [...]}`. Query the 28 completed days ending yesterday. Use the fixed account IDs and fields in `windsor.mjs`; query LinkedIn `organization_follower_count` separately for yesterday and treat it as a current snapshot. Do not store credentials or individual user/customer data in this input. Run:

`node .github/scripts/import_windsor_snapshot.mjs data.js provider-results.json output.js`

Publish only the generated `data.js` after fetching the latest branch/file. Preserve concurrent updates using an expected branch head, and rerun the merge against the latest data if the branch changed. Verify the deployment and public source timestamps before reporting success. On provider failure, preserve historical values and publish the failure state. On publishing failure, report the blocker; never claim fresh data was delivered.
