/**
 * Apply migrations during a deploy — but only a production one.
 *
 * `build` ran `prisma migrate deploy` unconditionally, so every build applied
 * DDL to whatever DATABASE_URL that environment happened to hold. On Vercel,
 * preview environments inherit production's environment variables unless
 * someone has overridden them per-environment, which means an unmerged branch
 * could migrate the production database on push. The same command runs from a
 * laptop: `vercel deploy --prod` and a local `bun run build` both reach it,
 * and CLAUDE.md already documents that .env.local points DATABASE_URL at the
 * production Neon database.
 *
 * The guard is deliberately narrow. It refuses only when Vercel has told us
 * this is *not* a production deploy; anything else behaves exactly as before,
 * so local builds and CI are unaffected. Removing migration from the deploy
 * altogether would trade this footgun for a worse one — a schema that silently
 * never catches up with the code that expects it.
 */

import { spawnSync } from "node:child_process";

const vercelEnv = process.env.VERCEL_ENV;

if (vercelEnv && vercelEnv !== "production") {
  console.log(
    `[migrate-on-deploy] VERCEL_ENV=${vercelEnv}: skipping migrations.\n` +
      "[migrate-on-deploy] Only a production deploy may apply DDL, because " +
      "preview environments can inherit the production DATABASE_URL.",
  );
  process.exit(0);
}

console.log(
  `[migrate-on-deploy] VERCEL_ENV=${vercelEnv ?? "<unset>"}: applying migrations.`,
);

/**
 * Migrations run over the direct connection when one is configured.
 *
 * DATABASE_URL is Neon's pooled (pgbouncer) endpoint in production. The
 * migration engine takes a session-level advisory lock and issues DDL, which
 * is the classic way to hang against a transaction-mode pooler.
 *
 * docs/DEPLOYMENT.md has been instructing operators to set DIRECT_URL since it
 * was written and nothing in this codebase read it, so the variable did not
 * exist as far as Prisma was concerned. DATABASE_URL_UNPOOLED is what the
 * Neon integration actually provisions and is already present in production,
 * so both are accepted.
 *
 * Only this invocation is redirected. The application keeps using the pooled
 * URL, which is what a serverless runtime wants. Prisma 7's config datasource
 * accepts only `url`, so this is an environment override rather than a
 * `directUrl` in prisma.config.ts.
 */
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED;

if (directUrl) {
  console.log(
    "[migrate-on-deploy] using the direct (non-pooled) connection for DDL.",
  );
}

const result = spawnSync("bunx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: directUrl ? { ...process.env, DATABASE_URL: directUrl } : process.env,
});

process.exit(result.status ?? 1);
