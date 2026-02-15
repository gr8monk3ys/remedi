# Sentry Alerts (Recommended)

This project already emits Sentry events (when `NEXT_PUBLIC_SENTRY_DSN` is set). To make Sentry actionable in production, set up a small set of alert rules.

## Prerequisites

- Set `NEXT_PUBLIC_SENTRY_DSN` in production.
- (Recommended) Set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` so builds can upload source maps.

## High-Signal Alert Rules

### 1) API 5xx Spike

Goal: catch outages quickly.

- Condition: error events increase above your normal baseline (for example: X events in 5 minutes).
- Filter: server environment (production).
- Notify: Pager/Slack/Email.

### 2) Stripe Webhook Failures

Goal: billing breaks are silent without an alert.

- Condition: any error in the `/api/webhooks/stripe` transaction, or error events containing `stripe` + `webhook`.
- Response playbook:
  - Check `/admin/production` for “Stripe Webhook” last received timestamp/event.
  - Check Stripe Dashboard -> Developers -> Webhooks -> recent attempts.

### 3) Rate Limit Exceeded (Abuse / Cost Control)

Goal: detect abuse, misconfigured clients, or sudden traffic spikes.

This app captures a warning message: `API rate limit exceeded`

- Condition: `API rate limit exceeded` > N times in 5 minutes.
- Suggested grouping/tag filters:
  - `rate_limit.identifier` (endpoint bucket, for example `ai-search`)
  - `http.route`
  - `rate_limit.source` (`upstash` vs `in-memory`)

### 4) OpenAI / AI Search Failures

Goal: AI search becomes unreliable due to upstream errors or quota exhaustion.

- Condition: errors in AI endpoints or errors containing `openai`.
- Response playbook:
  - Verify `OPENAI_API_KEY` and account limits.
  - Look at `429` and `5xx` rates separately.

## Suggested “Warn Only” Rules

These are useful, but can be noisy:

- Client-side error spike (new deploy regression).
- Slow transaction p95/p99 regressions on `/api/search`.
