# Make Scenario Specification

## Scenario identity

| Setting | Value |
| --- | --- |
| Scenario name | `Joyleaf Weekly Dashboard Refresh` |
| Count | **One** scenario only |
| Primary trigger | Webhooks → Custom Webhook, named `joyleaf-dashboard-refresh` |
| Scheduling mode | Immediately as data arrives |
| Manual execution | `POST` the custom webhook URL with `{"trigger":"manual"}` |
| Weekly execution | The checked-in GitHub Actions workflow posts `{"trigger":"weekly"}` to the same custom webhook URL every Monday at 13:00 UTC |
| Output | One GitHub repository-dispatch request carrying the complete normalized payload |
| Dashboard file changed | `data.js` only, committed by the repository workflow |

## Module sequence

The final saved scenario uses the following linear route. A source module may be present but disabled until its authorization and account-selection step is complete. Its error handler must emit the source object shown in the data contract instead of stopping the run.

| Order | Make module / role | Connection required | Operations per run | Output rule |
| ---: | --- | --- | ---: | --- |
| 1 | Webhooks — Custom Webhook | None | 1 request trigger | Reads `trigger` and optional ISO timestamp. |
| 2–10 | One metric-retrieval module per available platform: Google Business Profile, Meta/Instagram, Meta/Facebook, YouTube, LinkedIn, Leafly, Weedmaps, Yelp, and Google reviews | Each platform, only if available | At most one each | Produces `{status, metrics, reason}`. Failed/unavailable module handler emits stale source state. |
| 11 | OpenAI — Create a response/chat completion | OpenAI | **1** | Runs exactly once with `prompts/dashboard-insight.md`; JSON-only, 120 output-token maximum. |
| 12 | GitHub — Make an API call | GitHub | **1** | `POST /repos/shaniakhan1/joyleafdashboard/dispatches`, event type `joyleaf_dashboard_refresh`, body is the normalized payload. |
| 13 | Webhooks — Webhook response | None | 0 additional data API calls | Return `202` and a terse `{accepted:true, trigger}` body. |

The expected Make operation envelope is therefore **one trigger, one operation per actually enabled source, one OpenAI call, and one GitHub dispatch**. It intentionally does not use storage modules, data stores, spreadsheets, routers that duplicate output bundles, an iterator, an aggregator, or an extra Make scenario.

## Source-specific configuration

| Source | Enable only after | Metric fields sent to payload | Fallback |
| --- | --- | --- | --- |
| Google Business Profile + reviews | User selects Joyleaf’s business/location in Make | `google.*`, `reviews.rating`, `reviews.joyleaf_count` | Keep last Google/review values stale. |
| Instagram | User authorizes the Facebook account owning Joyleaf’s Instagram business account and chooses the account | `instagram.*` | Keep last Instagram values stale. |
| Facebook | User authorizes the Facebook Page connection and chooses Joyleaf’s Page | `facebook.*` | Keep last Facebook values stale. |
| YouTube | User selects the Joyleaf YouTube channel | `youtube.*` | Keep last YouTube values stale. |
| LinkedIn | User selects the Joyleaf organization/page if the account/API exposes analytics | `linkedin.*` | Keep last LinkedIn values stale. |
| Leafly | User authorizes an official Joyleaf-accessible reporting connection/API, if available | `leafly.*` | Keep last Leafly values stale. |
| Weedmaps | User authorizes an official Joyleaf-accessible reporting connection/API, if available | `weedmaps.*` | Keep last Weedmaps values stale. |
| Yelp | User authorizes the Joyleaf business/analytics connection/API, if available | `yelp.*` | Keep last Yelp values stale. |

> Do **not** add a connection, scraping step, or credential simply to fill a missing field. A source not exposed by the authorized account remains `unavailable`, and its existing values stay visible with a stale status.

## Guided connection sequence

I will configure each module up to the point where Make shows its native **Add connection** or provider sign-in page. At that point, the user needs only to select the relevant Joyleaf/FLP account and approve the provider’s consent screen. I will then continue automatically to the next connection. No account password, OAuth token, or API key belongs in this repository or chat.

## GitHub dispatch settings

Configure the final GitHub module as follows after authorizing the repository account in Make:

```text
Method: POST
URL: /repos/shaniakhan1/joyleafdashboard/dispatches
Headers: Accept: application/vnd.github+json
Body:
{
  "event_type": "joyleaf_dashboard_refresh",
  "client_payload": {{normalized_refresh_payload}}
}
```

The Make connection authorizes the request; no GitHub personal-access token is mapped or stored. The receiving workflow merges the payload with the checked-in current `data.js`, retains stale fields, and commits only if `data.js` changed.

## Required one-time repository secret

After Make creates the Custom Webhook, add its URL to the repository’s Actions secret named `MAKE_JOYLEAF_REFRESH_WEBHOOK`. The weekly workflow can then call the same immediate scenario. This secret is a URL, not a platform credential; never place it in `data.js`, a mapping, or the blueprint export.

## References

[1] [Make Help Center — Webhooks](https://help.make.com/webhooks)
[2] [Make Help Center — Scenario blueprints](https://help.make.com/blueprints)
[3] [GitHub Docs — Repository dispatch event](https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#repository_dispatch)
