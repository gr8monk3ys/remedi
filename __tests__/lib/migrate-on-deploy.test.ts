/**
 * A preview build must never apply DDL to the production database.
 *
 * `build` ran `prisma migrate deploy` unconditionally, so every build migrated
 * whatever DATABASE_URL that environment held. On Vercel, preview
 * environments inherit production's variables unless someone has overridden
 * them per-environment — so an unmerged branch could migrate production on
 * push. The same command is reachable from a laptop, and CLAUDE.md already
 * documents that .env.local points DATABASE_URL at the production Neon
 * database.
 *
 * These run the real script rather than a re-implementation of its decision,
 * because the thing that must hold is what `bun run build` actually does.
 */

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";

const SCRIPT = path.resolve(process.cwd(), "scripts/migrate-on-deploy.ts");

const run = (vercelEnv: string | undefined) =>
  spawnSync("bun", ["run", SCRIPT], {
    encoding: "utf8",
    env: {
      ...process.env,
      // Unreachable on purpose: if the guard lets the command through, it
      // fails to connect, which is how we can tell it was not skipped without
      // touching a real database.
      DATABASE_URL: "postgresql://nobody:nobody@127.0.0.1:1/none",
      DIRECT_URL: "",
      DATABASE_URL_UNPOOLED: "",
      ...(vercelEnv === undefined ? {} : { VERCEL_ENV: vercelEnv }),
    },
  });

describe("migrate-on-deploy", () => {
  it("skips migrations on a preview deploy", () => {
    const { stdout, status } = run("preview");

    expect(stdout).toMatch(/skipping migrations/i);
    expect(stdout).not.toMatch(/applying migrations/i);
    expect(status).toBe(0);
  });

  it("skips migrations on a development deploy", () => {
    expect(run("development").stdout).toMatch(/skipping migrations/i);
  });

  it("applies migrations on a production deploy", () => {
    // The guard must not become "never migrate" — that would trade one footgun
    // for a schema that silently never catches up with the code.
    const { stdout } = run("production");

    expect(stdout).toMatch(/applying migrations/i);
    expect(stdout).not.toMatch(/skipping migrations/i);
  });

  it("leaves non-Vercel builds alone", () => {
    // Local builds and CI have no VERCEL_ENV and must behave as before.
    const { stdout } = run(undefined);

    expect(stdout).toMatch(/applying migrations/i);
    expect(stdout).toMatch(/<unset>/);
  });
});
