export function isSentryConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}
