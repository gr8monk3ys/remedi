/**
 * Browser instrumentation.
 *
 * Sentry v9+ loads its browser SDK from this file. The project had
 * sentry.client.config.ts — the v8 filename — which nothing imported, so
 * `Sentry.init` never ran in the browser and no client-side error was ever
 * reported.
 *
 * Note what that means for Session Replay: the masking settings in
 * sentry.client.config.ts were never active, so no replays were captured. They
 * become active the moment this file exists, which is precisely why the
 * masking had to be correct first.
 */

import * as Sentry from "@sentry/nextjs";

export * from "./sentry.client.config";

/** Report client-side navigations so traces are not truncated at the route. */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
