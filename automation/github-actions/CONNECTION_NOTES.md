# Provider connection notes

## YouTube — 2026-08-13

- Authorized YouTube Studio channel: **Joyleaf**.
- Channel ID: `UC1IIAz60fxLfwyyXCQv-3sA`.
- The Joyleaf Google Cloud project (`joyleaf-dashboard-reporting`, project number `937756072758`) has been configured to enable the YouTube Analytics API.
- The dashboard mapping needs the last-28-day Analytics API metrics `views` and `subscribersGained`; current total channel subscribers can be read from YouTube Studio but requires a separate authorized Data API query if retained as the dashboard’s `subscribers` metric.
- The Google OAuth refresh token must be reauthorized with the YouTube Analytics read-only scope while retaining the existing Business Profile scope before the GitHub Actions collector can call the report endpoint.

## Other providers

- LinkedIn requires an organization analytics token with the approved organization-reporting permission.
- Leafly and Weedmaps dashboard performance metrics require the client’s business/partner reporting access or a provider-issued export/reporting endpoint.
- Yelp’s dashboard performance metrics require business-owner reporting access; publicly available business search data is insufficient for impressions, leads, and action metrics.
- The `reviews` source should use a named, authorized review-aggregation endpoint or be mapped from an approved primary review provider; it must not be estimated from public data.

## Current Google OAuth state

The active **Web client 1** for `joyleaf-dashboard-reporting` has client ID `937756072758-ujefk75qalibsl90bejantse37ukr2h0.apps.googleusercontent.com` and retains `https://developers.google.com/oauthplayground` as an authorized redirect URI. A previously downloaded web client was deleted and must not be reused. YouTube Analytics API and YouTube Data API v3 are enabled in the project. A second active client secret was created under Web client 1 so the existing credential can remain enabled while the combined Google Business Profile and read-only YouTube authorization is tested. Do not record or commit any secret value.

## Official provider access findings

| Source | Dashboard API status | Client-owned next action |
|---|---|---|
| LinkedIn | Organization statistics are available through LinkedIn Community Management API after approved product access and organization-administrator OAuth consent. | Obtain approved Community Management API access and an organization analytics token. |
| Leafly | Business metrics are visible in Leafly Biz, but no official programmatic analytics API was identified. | Export a client-authorized reporting file or obtain a provider-issued reporting endpoint. |
| Weedmaps | Official developer APIs focus on menu synchronization and orders, not listing-performance analytics. | Obtain an authorized business report/export; do not synthesize analytics from menu or order APIs. |
| Yelp | Reporting metrics are available only to eligible Yelp partners or contracted advertisers, not ordinary business logins. | Ask Yelp support or the client account owner to provision Reporting API access or an approved report export. |
| Reviews | Aggregate rating and count can be retrieved through an official approved review provider such as Google Places, but must be configured as a named source. | Choose the approved review system and provide its business identifier and credential. |

Official references: https://developers.google.com/youtube/analytics/reference/reports/query ; https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview ; https://business.leafly.com/ ; https://developer.weedmaps.com/docs/overview ; https://docs.developer.yelp.com/docs/reporting-api ; https://developers.google.com/maps/documentation/places/web-service/place-details

## YouTube authorization validation

The new client-owned Google refresh token successfully returned official YouTube Analytics for the intended Joyleaf channel ID `UC1IIAz60fxLfwyyXCQv-3sA` when queried directly. The validation period 2026-07-16 through 2026-08-12 returned 9,861 views and 3 subscribers gained. The administrator account’s `mine=true` channel response identifies Shania’s personal channel; therefore the production collector must use the explicit Joyleaf channel ID rather than `mine=true`. This direct-channel query confirms the administrator permission can access Joyleaf’s Analytics report data despite the brand-account chooser’s service restriction.
