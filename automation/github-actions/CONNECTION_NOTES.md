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

## LinkedIn administrator access validation

The reconnected LinkedIn session has administrator access to the official **JoyLeaf** organization, numeric organization ID `97213401` (`urn:li:organization:97213401`). LinkedIn’s administrator dashboard identifies 692 followers and currently exposes its Analytics section. The dashboard currently reports 181 search appearances, 0 new followers, 114 post impressions, and 4 page visitors for the latest seven-day card. This browser access alone does not create a long-lived programmatic credential; the GitHub Actions collector still needs LinkedIn-approved Community Management API product access and an OAuth token with organization analytics permission before it can safely mark the LinkedIn source fresh.

## LinkedIn app branding asset

The client supplied the approved square Joyleaf logo (`JoyleafLogo.png`, 1000×1000) for the Joyleaf Dashboard Reporting LinkedIn app. The asset is ready for upload to the app-registration form and should not be committed to the public dashboard repository unless separately requested.

## LinkedIn reporting app created

On 2026-08-13, the account administrator confirmed creation of the LinkedIn app named **Joyleaf Dashboard Reporting**, associated irreversibly with the official JoyLeaf organization (ID `97213401`). The configured privacy policy is `https://joyleaf.com/privacy-policy`, and the client-supplied square Joyleaf logo was uploaded. Remaining steps are to add the LinkedIn-approved organization analytics product, configure the app’s callback URL, obtain a client-owned OAuth token with the required organization permissions, and add only those credentials to the existing GitHub Actions source configuration after a successful reporting request.

## LinkedIn Community Management requirement

LinkedIn’s official documentation confirms that organization-level page analytics are available through the **Community Management API**. The new Joyleaf app must request the Community Management API **Development Tier** and use the least-privilege organization reporting permission `rw_organization_admin`; LinkedIn confirms that this permission supports organization-page management and reporting-data retrieval. Community Management access is a vetted product, and development-tier approval is required before the authorization screen exposes the product’s organization scopes. LinkedIn access tokens expire after 60 days; long-lived programmatic refresh tokens are only available to a limited set of partners, so the weekly GitHub Actions architecture may require a periodic client-owned reauthorization unless LinkedIn grants refresh-token access.

Official references: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview ; https://learn.microsoft.com/en-us/linkedin/marketing/community-management/organizations/organization-lookup-api ; https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow

## LinkedIn Community Management request submitted

On 2026-08-13, the Joyleaf account administrator confirmed submission of the **Community Management API Development Tier** access request for the Joyleaf Dashboard Reporting LinkedIn app. LinkedIn metrics must remain stale in `data.js` until LinkedIn approves this request, the `rw_organization_admin` permission is available to the app, and a direct reporting request succeeds with the app’s client-owned credential.

## Leafly Biz CSV baseline imported

On 2026-08-13, the client provided a Leafly Biz CSV covering **2026-07-01 through 2026-08-01**. The export was validated and imported into the existing Leafly dashboard metrics as a **stale baseline**, not a fresh automated source: **25 orders**, **16 orders with a deal**, and **$3,059.96 GMV**. The export did not contain sessions or reviews, so those fields remain retained stale values. Percentage-change fields were cleared because the export contained no comparable prior period. The raw CSV was intentionally not committed to the public repository. Automatic Leafly freshness still depends on a provider-approved recurring analytics export or reporting endpoint.
