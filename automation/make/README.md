# Joyleaf Dashboard Automation

## Scope and operating constraint

This directory defines exactly **one Make scenario** for the existing `joyleafdashboard` repository. The scenario is intentionally limited to: collecting permitted Joyleaf platform metrics, retaining the last known value for any unavailable or failed source, making one OpenAI API call for dashboard insight text, and committing only the existing `data.js` dashboard payload through GitHub. It does not introduce Google Sheets, Looker Studio, a database, an additional dashboard, or another Make scenario.

## Verified Make behavior

Make is currently available in the existing organization, which is on the Free plan with 1,000 credits available and zero active scenarios as observed on 2026-08-11. The scenario must therefore minimize operations.

A Custom Webhook normally runs a Make scenario immediately. Make also supports scheduling webhook processing; if scheduled weekly, all manually sent requests wait in the webhook queue until the next scheduled time. Consequently, immediate manual refreshes and an autonomous weekly refresh cannot both originate from a single Make scenario alone. The supported one-scenario implementation is an **immediate Custom Webhook scenario** plus a weekly POST to its same webhook URL from one existing external scheduler. The repository includes an opt-in GitHub Actions caller that preserves the dashboard’s static hosting setup and does not deploy a new dashboard.

> The Make scenario stays immediate for manual `POST` requests. The weekly caller sends `{ "trigger": "weekly" }`; a person sends `{ "trigger": "manual" }`. Both enter the same route and run the same metric refresh.

## Required authorizations

All authorizations must be created by the repository owner **inside Make**, one at a time, before the relevant module is enabled. The design has no stored platform tokens, OAuth client secrets, or GitHub token in this repository. The necessary connection types are GitHub, OpenAI, Google Business Profile, Meta (Instagram/Facebook), YouTube, LinkedIn, Leafly, Weedmaps, and Yelp; an unavailable source remains disabled or fails onto its stale-data fallback without writing zeroes.

## References

[1] [Make Help Center — Webhooks](https://help.make.com/webhooks)
[2] [Make Help Center — Scenario blueprints](https://help.make.com/blueprints)

## Configuration progress

The one scenario shell was created in the existing Make workspace and named `Joyleaf Weekly Dashboard Refresh`. Make opened it with an unintended Instagram event trigger from the creation flow; that starter trigger will be removed and replaced with a Custom Webhook before any source connection is created. No platform account has been authorized or accessed.

The accidental starter trigger has no webhook or connection configured, so no Instagram or Meta authorization has been requested or created. It is safe to remove before adding the intended Custom Webhook trigger.

The scenario remains unsaved and contains only the initial empty starter module. No execution has run and no external account request has been sent.

The unused starter module remains unconfigured. It has not been saved, enabled, or run.

The accidental starter module was undone. The active unsaved Make canvas is now a clean, single scenario shell named `Joyleaf Weekly Dashboard Refresh`, with no modules, connections, webhooks, executions, or authorizations.

While selecting the trigger app, Make added an unconfigured `Make AI Toolkit — Simple Text Prompt` module to the unsaved canvas. It has no mapping, connection, execution, or authorization; it will be undone before the required Custom Webhook is added.

No Make connection has been authorized, saved, or run. The one scenario remains unsaved while its trigger is being prepared.

The clean single scenario has reached Make’s app-selection dialog. No platform module, source authorization, webhook, or run has been saved; the next selection is the built-in Webhooks app.

The one scenario now contains the intended **Webhooks → Custom webhook** trigger in its unsaved configuration screen. It is set to Make’s immediate webhook mode. This trigger requires no external-platform authorization.

The Custom Webhook is named `joyleaf-dashboard-refresh`. API-key authentication has not been enabled, so the endpoint URL itself will be stored only as a GitHub Actions secret after Make displays it.

The Custom Webhook trigger configuration has been saved on the single unsaved scenario canvas in immediate mode. Make is waiting for a sample payload only to establish field mappings; no platform API call will occur during that schema-capture step.

The scenario is now saved in Make as scenario `5917560` with exactly one configured module: **Webhooks → Custom webhook**. It remains in immediate mode and has no platform connection or source module yet.

A non-live sample payload was successfully received by the saved webhook, establishing the mapped top-level fields `run`, `period`, `sources`, and `insight`. The schema-capture execution consumed one Make operation and made no source-platform or OpenAI call.

Make’s schedule settings confirm the scenario is configured to run **Immediately** when the Custom Webhook receives a request. The weekly caller will therefore use the same webhook URL rather than changing this setting to queued weekly processing.

The saved scenario remains stable after schema capture; it has one Custom Webhook trigger, one observed sample execution, and no additional source modules or connections.

Repository checkpoint: the dashboard stale-data safeguards, merger, GitHub workflow, mappings, prompt, fixtures, and Make configuration record were committed to `main` as `110e542` on 2026-08-11. The Make scenario is saved separately as `5917560` and awaits source connections.

A Make blueprint export was initiated from scenario `5917560` after the webhook trigger and schema capture were saved. The exported file is copied into this directory as the current blueprint checkpoint before any source connections are added.

The saved Make scenario title has been corrected to `Joyleaf Weekly Dashboard Refresh`; its scenario ID remains `5917560`.

The corrected saved scenario blueprint was exported again from Make after the scenario name was fixed. The export is being collected for version control as the current webhook-only checkpoint.

The scenario title was explicitly resubmitted and saved again as `Joyleaf Weekly Dashboard Refresh` in the Make editor. The editor confirmed the save; the detail-page heading may lag until its next refresh.

The Make editor is connected again and confirms the webhook-only scenario configuration remains saved in immediate mode. The next action is to add the first source module, stopping at its native authorization prompt.

The repository now has the encrypted Actions secret `MAKE_JOYLEAF_REFRESH_WEBHOOK`. The weekly GitHub Actions caller can invoke the same Make Custom Webhook once the Make scenario is fully configured and activated.

The Google Business Profile app was selected in the next-module picker. No Google account, business location, metric request, or source connection has been authorized or executed yet.

The scenario remains linear with only the Custom Webhook trigger after an unintended router was undone. The next source-module attachment control is visible on the webhook’s right side; no source connection, OpenAI call, or data refresh has been run.

Make’s currently available Google Business Profile app exposes post-management modules in the picker, not the performance measures mapped by this dashboard. It is intentionally not added as a non-metric call; Google values remain stale until an authorized metrics-capable endpoint is available.

The linear scenario now has an unsaved **Instagram for Business (Facebook login) → Get user insights** module immediately after the Custom Webhook. Make is displaying its native **Create a connection** control; no Meta account has been authorized, selected, or queried.

At the user’s request, both duplicate `Shania's Facebook connection` records were deleted from Make. The saved scenario was restored to its webhook-only state, with no Meta module, Page selection, or source query retained. The previous sample webhook execution remains the sole execution.

After the clean reset, the Instagram for Business **Get user insights** module has been re-added after the webhook and shows only the native **Create a connection** button. No Facebook connection exists or has been selected.

A fresh Facebook connection successfully revealed `Joy Leaf (Roselle) (@joyleafdispensary)`. The Make user-insights module’s Lifetime options are audience-demographic metrics only; they do not map to the existing dashboard’s account measures. The unsaved module was removed to avoid an irrelevant call, and Instagram fields remain stale rather than being zeroed or replaced.

The one OpenAI response module uses the existing `My OpenAI connection`, `GPT-5.6: gpt-5.6-luna (system)`, and a compact prompt that maps the webhook’s `insight.content` and `sources` fields. The prompt was entered directly in Make after the editor rejected automated text injection.

The saved Make scenario now has exactly two modules: Custom Webhook → OpenAI Generate a response. The OpenAI module uses the low-cost `GPT-5.6: gpt-5.6-luna (system)` selection and one compact prompt mapping current `sources` plus the previous insight.

An unintended unsaved GitHub **Get an Organization** module was removed before connection, authorization, or execution. The scenario remains Custom Webhook → OpenAI only.

The native GitHub modules available in this Make workspace did not expose a repository file-update or repository-dispatch action. A temporary HTTP bridge was explored but never saved or executed. The saved scenario therefore remains **Custom Webhook → OpenAI Generate a response** until a secure GitHub credential method can be used.

Two fine-grained, repository-only GitHub credentials were created during the attempt, detected as unsafe to continue using, and revoked immediately. No Make keychain was created, no token is stored in the repository, and no HTTP call reached GitHub. The existing GitHub Actions merger remains documented and ready to accept the `joyleaf_dashboard_refresh` repository-dispatch payload once the bridge can be completed through a safe credential channel.
