# Self-contained weekly live refresh

The public dashboard refresh is self-contained in GitHub Actions. It does not call Make or Manus at runtime. Every Monday at 13:00 UTC, GitHub Actions calls the configured provider endpoints, makes **one** OpenAI API call, merges fresh values into `data.js`, retains prior values for any failed source, and commits the result. GitHub Pages then republishes the existing dashboard.

## Required encrypted Actions secrets

Add the following through **Settings → Secrets and variables → Actions**. Do not commit tokens, OAuth client secrets, refresh tokens, or business IDs.

| Secret | Purpose |
|---|---|
| `OPENAI_API_KEY` | The account owner's OpenAI API key for exactly one generated dashboard insight per run. |
| `JOYLEAF_SOURCE_CONFIG` | A single JSON object that holds endpoint URLs, authorization values, and metric paths for all provider sources. GitHub masks this secret in logs. |

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

## Google Business Profile setup checkpoint (2026-08-12)

The `shania@flpmarketinggroup.com` Google account can manage the verified Joyleaf Weed Delivery and Joyleaf Weed Dispensary Business Profiles. The `Joyleaf Dashboard Reporting` Google Cloud project was created under `flpmarketinggroup.com`; the Business Profile Performance API and My Business Business Information API were enabled. OAuth consent configuration remains in progress and no OAuth client secret, refresh token, or client credential has been placed in the repository.

```text
Project: joyleaf-dashboard-reporting
Managed Joyleaf profiles: delivery and dispensary
Runtime: GitHub Actions only (no Make or Manus dependency)
```
