# Self-contained weekly live refresh

The public dashboard refresh is self-contained in GitHub Actions. It does not call Make or Manus at runtime. Every Monday at 13:00 UTC, GitHub Actions calls the configured provider endpoints, makes **one** OpenAI API call, merges fresh values into `data.js`, retains prior values for any failed source, and commits the result. GitHub Pages then republishes the existing dashboard.

## Required encrypted Actions secrets

Add the following through **Settings → Secrets and variables → Actions**. Do not commit tokens, OAuth client secrets, refresh tokens, or business IDs.

| Secret | Purpose |
|---|---|
| `OPENAI_API_KEY` | The Joyleaf-dedicated OpenAI API key used for exactly one generated dashboard insight per run. |
| `GOOGLE_CLIENT_ID` | OAuth web-client ID for the Joyleaf Google Cloud project. |
| `GOOGLE_CLIENT_SECRET` | OAuth web-client secret for the Joyleaf Google Cloud project. |
| `GOOGLE_REFRESH_TOKEN` | Refresh token for the authorized Google account that manages the Joyleaf Business Profiles. |
| `JOYLEAF_SOURCE_CONFIG` | A single JSON object that holds endpoint URLs, authorization values, and metric paths for all non-Google provider sources. GitHub masks this secret in logs. |

`OPENAI_MODEL` is an optional Actions variable, not a secret. It defaults to `gpt-4o-mini` to minimize cost.

## `JOYLEAF_SOURCE_CONFIG` format

Each source is optional. If a source object is omitted, invalid, unauthorized, or returns no mapped numbers, the workflow retains its prior dashboard values and marks that source stale. The collector accepts a provider endpoint that returns JSON; `metrics_root` points at a metrics object and `metric_paths` maps dashboard metrics to JSON paths.

```json
{
  "google": {
    "url": "https://your-google-performance-adapter.example/metrics",
    "token": "GOOGLE_OAUTH_ACCESS_TOKEN_OR_ADAPTER_TOKEN",
    "metrics_root": "metrics",
    "metric_paths": {
      "searches": "searches",
      "direction_requests": "direction_requests",
      "phone_calls": "phone_calls",
      "website_clicks": "website_clicks",
      "photo_views": "photo_views"
    }
  },
  "instagram": {
    "url": "https://graph.facebook.com/v26.0/INSTAGRAM_ACCOUNT_ID/insights?metric=views,reach,total_interactions,follows_and_unfollows&period=day&metric_type=total_value",
    "token": "META_LONG_LIVED_ACCESS_TOKEN",
    "metrics_root": "metrics",
    "metric_paths": {
      "views": "views",
      "reach": "reach",
      "interactions": "interactions",
      "new_follows": "new_follows",
      "non_follower_reach": "non_follower_reach"
    }
  },
  "facebook": {
    "url": "https://graph.facebook.com/v26.0/PAGE_ID/insights?metric=page_views_total,page_post_engagements,page_daily_follows&period=days_28",
    "token": "META_PAGE_ACCESS_TOKEN",
    "metrics_root": "metrics",
    "metric_paths": {
      "views": "views",
      "interactions": "interactions",
      "page_visits": "page_visits",
      "new_follows": "new_follows"
    }
  },
  "youtube": {
    "url": "https://youtubeanalytics.googleapis.com/v2/reports?...",
    "token": "YOUTUBE_OAUTH_ACCESS_TOKEN_OR_ADAPTER_TOKEN",
    "metrics_root": "metrics",
    "metric_paths": {
      "views": "views",
      "subscribers": "subscribers",
      "new_subs": "new_subs"
    }
  },
  "linkedin": { "url": "https://YOUR_LINKEDIN_ANALYTICS_ENDPOINT", "token": "LINKEDIN_TOKEN", "metrics_root": "metrics" },
  "leafly": { "url": "https://YOUR_LEAFLY_BIZ_OR_PARTNER_METRICS_ENDPOINT", "token": "LEAFLY_TOKEN", "metrics_root": "metrics" },
  "weedmaps": { "url": "https://YOUR_WEEDMAPS_BUSINESS_OR_PARTNER_METRICS_ENDPOINT", "token": "WEEDMAPS_TOKEN", "metrics_root": "metrics" },
  "yelp": { "url": "https://YOUR_YELP_BUSINESS_OR_INSIGHTS_ENDPOINT", "token": "YELP_TOKEN", "metrics_root": "metrics" },
  "reviews": { "url": "https://YOUR_REVIEW_AGGREGATION_ENDPOINT", "token": "REVIEW_TOKEN", "metrics_root": "metrics" }
}
```

> The source endpoint must return the numbers required by the field map. Direct provider APIs often return nested arrays, so use `metric_paths` to point to the numeric values. A small provider-specific adapter may be needed where the public API does not return the dashboard's business-analytics metrics directly.

## Source coverage and provider limitations

Google Business Profile Performance, Meta Insights, YouTube Analytics, and Meta Page Insights can supply mapped measures through official APIs. LinkedIn organization analytics and the Leafly, Weedmaps, and Yelp business-performance fields may require approved business/partner analytics access or a provider-specific reporting endpoint. The workflow does not fabricate or zero values when those permissions are absent.

## Manual run

Open **Actions → Joyleaf dashboard refresh → Run workflow** in the repository to run the same self-contained collection immediately. The next scheduled run occurs every Monday at 13:00 UTC.

## Google Business Profile API access status (2026-08-13)

The authorized `shania@flpmarketinggroup.com` account manages the verified **Joyleaf Weed Delivery** and **Joyleaf Weed Dispensary** Business Profiles. The `joyleaf-dashboard-reporting` Google Cloud project uses OAuth credentials held only as encrypted GitHub Actions secrets; no client secret or refresh token is committed to the repository. The Business Profile Performance, My Business Business Information, and My Business Account Management APIs are enabled for the project.

```text
Google Cloud project: joyleaf-dashboard-reporting
Project number: 937756072758
Selected verified profile for the allowlist request: Joyleaf Weed Delivery
Runtime: GitHub Actions only (no Make or Manus dependency)
```

### Required allowlist request

The first self-contained refresh validated the OAuth configuration but received a `0 requests per minute` quota from `mybusinessaccountmanagement.googleapis.com`. The stale-safe merger retained the prior Google values rather than writing zeroes. Google’s legacy quota form now directs projects with a zero limit to request **Basic API Access** before requesting a higher quota.

A Basic API Access case has been submitted through Google Business Profile API support for this project: **case `4-9715000041685`**. Google displayed an estimated review time of **seven to ten working days**. Until the project is allowlisted, manual or scheduled refreshes will correctly preserve Google values as stale. After approval, run **Actions → Joyleaf dashboard refresh → Run workflow** to validate that the Google source is fresh.

> The `mybusinessaccountmanagement.googleapis.com` API is used solely for authorized account and location discovery before the workflow retrieves performance metrics. The weekly process is read-only and does not modify Business Profile listings.
