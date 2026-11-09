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
- Instagram, Facebook, LinkedIn, Leafly, Weedmaps and Yelp require configured authorized reporting sources. Their failures do not justify estimating values or calling them live.

## Verification

Run `node --test .github/scripts/*.test.mjs` and `node --check .github/scripts/collect_live_metrics.mjs`. After deployment, check the exact GitHub Actions commit and inspect the published `data.js` source statuses. Do not mark missing integrations resolved just because the build is green.

Official Google response references:
- https://developers.google.com/my-business/reference/performance/rest/v1/locations/fetchMultiDailyMetricsTimeSeries
- https://developers.google.com/my-business/reference/performance/rest/v1/TimeSeries

## Verified production result

The Nov 9 refresh successfully returned Google storefront performance and YouTube analytics. Instagram, Facebook, LinkedIn, Leafly, Weedmaps and Yelp have no configured reporting endpoint. Google Reviews access is denied (HTTP 403). These are unresolved access/configuration blockers, not repaired connections.
