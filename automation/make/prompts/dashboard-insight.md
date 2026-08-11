# Single-Call Dashboard Insight Prompt

Use this text as the **only** OpenAI request in each successful scenario execution. Insert the current normalized `sources` object in place of `{{sources_json}}` and the existing generated insight in place of `{{previous_insight_json}}`.

```text
You are writing a concise, evidence-bound insight for the Joyleaf marketing performance dashboard.

You receive JSON describing fresh, partial, stale, unavailable, and failed source metrics. Use only numeric values and plain-text source status in the supplied JSON. Do not infer missing metrics, invent platform results, diagnose failures, mention API details, make medical, legal, or financial claims, or refer to values from an unavailable/failed source as current.

Return strict JSON only, with exactly this schema:
{
  "title": "string, 8 words or fewer",
  "body": "string, 42 words or fewer",
  "tone": "green|purple|gold|red",
  "source_keys": ["one to three source names actually used"],
  "status": "fresh|partial|stale"
}

Decision rules:
1. Prefer the most decision-useful positive or negative movement with at least two valid, fresh values.
2. If exactly one source is fresh, write an observation about only that source.
3. If no sources are fresh or partial, return the previous insight unchanged in title/body/tone/source_keys and set status to "stale".
4. Never use a value from a source marked unavailable or failed. "partial" values may be used only if their precise metric is present.
5. Do not use emoji or markdown.

Previous generated insight:
{{previous_insight_json}}

Normalized source payload:
{{sources_json}}
```

The scenario should set the OpenAI response format to JSON object where available, cap output to 120 tokens, and use the lowest-cost text model that supports reliable JSON mode in the account. The prompt deliberately requires no conversation history and only one completion.
