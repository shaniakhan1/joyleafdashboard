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
