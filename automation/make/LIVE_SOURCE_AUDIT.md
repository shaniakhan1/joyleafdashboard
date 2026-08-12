# Live source audit

## Current state

The live dashboard is deployed, but all nine platform sources are currently marked `stale` because the active Make route receives no source payload. It preserves the prior values by design and does not write zeroes.

## Dashboard source requirements

| Source | Existing dashboard measures | Viable live path | Access dependency |
|---|---|---|---|
| Google Business Profile | Searches, directions, calls, website clicks, photo views | Business Profile Performance API daily metrics | Google Business Profile manager plus Performance API access/quota |
| Instagram | Views, reach, interactions, follows, non-follower reach | Instagram Graph API account insights | Joyleaf professional Instagram account and Meta Business authorization with insights scope |
| Facebook | Views, interactions, page visits, follows | Facebook Pages Insights Graph API | Joyleaf Page access with Analyze task and Pages insights scope |
| YouTube | Views, subscribers, new subscribers | YouTube Analytics API | Channel owner/manager Google authorization |
| LinkedIn | Impressions, reactions, followers | LinkedIn organization analytics API | Organization admin and approved analytics access |
| Leafly | Sessions, reviews, orders, deal orders, GMV | Leafly Biz reporting or order/POS API | Leafly Biz or partner API credentials; public order API does not guarantee analytics coverage |
| Weedmaps | Clicks, visitors, spend, GMV | Weedmaps business reporting or partner Orders API | Weedmaps Business/partner credentials; public Orders API does not guarantee ad/reporting coverage |
| Yelp | Impressions, visits, leads, calls | Yelp Business/Insights or Leads API | Yelp business/partner entitlement; public Places API does not provide account performance analytics |
| Reviews | Ratings and review counts | Google Business Profile plus Yelp/Leafly where available | Source-by-source read authorization |

## Minimum-operation design

The existing single Make scenario should aggregate only successfully returned source objects and make exactly one OpenAI call after source collection. Each source response must be normalized to the `data.js` field map, with unchanged values retained for any failed, unauthorized, or unsupported source. The GitHub dispatch remains the final step.

## Official documentation consulted

- Google Business Profile Performance API: <https://developers.google.com/my-business/reference/performance/rest>
- Instagram Account Insights: <https://developers.facebook.com/documentation/instagram-platform/api-reference/instagram-user/insights>
- Facebook Page Insights: <https://developers.facebook.com/docs/graph-api/reference/insights/>
- Leafly order API: <https://help.leafly.com/s/article/Leafly-API-Documentation>
- Weedmaps developer overview: <https://developer.weedmaps.com/v2026.01/docs/overview>
- Yelp developer documentation: <https://docs.developer.yelp.com/docs/getting-started>
