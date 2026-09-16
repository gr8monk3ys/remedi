import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// Lighthouse score floors for the public, session-free routes, plus a byte
// budget on the home document. Ported from vivancedata's check so the
// 2026-09-13..16 Lighthouse work (inlined stylesheet, animation gates, font
// swap, Sentry idle-load) cannot regress without a red check.
//
// Runs with `--preset=desktop`: mobile devtools throttling is too noisy on
// shared GitHub runners to hold a floor. Production mobile numbers are
// measured separately against https://remedi.vivancedata.com and are not what
// this script gates.
//
// The app is built with E2E_LOCAL_AUTH=true in CI (the same Clerk stub the
// e2e job uses) because Clerk's real middleware refuses the placeholder keys.
// Clerk's own runtime script therefore does not load here; every other byte
// on the page is the production bundle.
//
// Floors are MEASURED, not aspirational: performance sits 2 below the minimum
// observed across repeated runs, the others at their observed value. A floor
// that flakes gets bypassed; a floor that never fails is useless. Raise a
// floor whenever the real score improves.
const SCORE_FLOORS = {
  // Local production build, 3 runs x 5 routes: 100 everywhere except
  // /compare at 99. Floor is 2 below that minimum.
  performance: 97,
  accessibility: 100,
  bestPractices: 100,
  seo: 100,
};

// Per-route exceptions, each pinned at its real score so a further slide
// still fails. /pricing: an h3 card title under the h1 (heading-order) and
// the primary CTA on the premium gradient panel (color-contrast). /compare:
// an h3 inside a fixed-position overlay (heading-order). Delete an entry
// once its page is fixed and the route is held at 100 like the others.
const ROUTE_FLOORS = {
  "/pricing": { accessibility: 95 },
  "/compare": { accessibility: 98 },
};

// Gzipped bytes of the home document. `experimental.inlineCss` folds the
// stylesheet into the HTML, so the document is now the first-paint payload
// and a stray inlined asset shows up here first. Set ~25% above the measured
// size; the measured number is printed on every run so the cap can track it.
// Measured 2026-09-16: 66,004 bytes gzipped on a local production build.
const HOME_DOC_BYTE_CAP = 82_500;

const MAX_ATTEMPTS = 4;
const artifactDir = join(process.cwd(), "artifacts", "lighthouse");
const [baseUrl, ...routes] = process.argv.slice(2);

if (!baseUrl || routes.length === 0) {
  console.error(
    "Usage: node scripts/check-lighthouse-score.mjs <baseUrl> <route...>",
  );
  process.exit(1);
}

const outputDir = mkdtempSync(join(tmpdir(), "remedi-lighthouse-"));

try {
  mkdirSync(artifactDir, { recursive: true });

  for (const route of routes) {
    const url = new URL(route, baseUrl).toString();
    const floors = { ...SCORE_FLOORS, ...(ROUTE_FLOORS[route] ?? {}) };
    warmRoute(url);
    let bestAttempt = null;
    let attemptsRun = 0;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      attemptsRun = attempt;
      const reportPath = join(
        outputDir,
        `${artifactSlug(route)}-attempt-${attempt}.json`,
      );
      const scores = runLighthouse(url, reportPath);

      console.log(
        `[lighthouse] ${route} attempt ${attempt} -> ${JSON.stringify(scores)}`,
      );

      if (!bestAttempt || totalScore(scores) > totalScore(bestAttempt.scores)) {
        bestAttempt = { attempt, scores, reportPath };
      }

      if (
        Object.entries(scores).every(
          ([k, score]) => score >= (floors[k] ?? 100),
        )
      ) {
        break;
      }
    }

    const failures = Object.entries(bestAttempt.scores).filter(
      ([k, score]) => score < (floors[k] ?? 100),
    );
    copyFileSync(
      bestAttempt.reportPath,
      join(artifactDir, `${artifactSlug(route)}.json`),
    );

    if (failures.length > 0) {
      console.error(
        `[lighthouse] ${route} fell below its score floors after ${attemptsRun} attempt(s): ${failures
          .map(([category, score]) => `${category}=${score}`)
          .join(", ")}`,
      );
      logFailureDiagnostics(bestAttempt.reportPath);
      process.exit(1);
    }
  }

  checkHomeDocumentBytes(new URL("/", baseUrl).toString());
} finally {
  rmSync(outputDir, { recursive: true, force: true });
}

function artifactSlug(route) {
  return route === "/"
    ? "root"
    : route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
}

function runLighthouse(url, reportPath) {
  const result = spawnSync(
    "npx",
    [
      "-y",
      "lighthouse",
      url,
      "--preset=desktop",
      "--quiet",
      "--chrome-flags=--headless=new --no-sandbox",
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json",
      `--output-path=${reportPath}`,
    ],
    { encoding: "utf-8" },
  );

  if (result.error) {
    console.error(`Failed to run Lighthouse for ${url}:`, result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  const report = JSON.parse(readFileSync(reportPath, "utf-8"));
  return {
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    bestPractices: Math.round(report.categories["best-practices"].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
  };
}

function warmRoute(url) {
  spawnSync("curl", ["-fsSLo", "/dev/null", url], { stdio: "ignore" });
}

function totalScore(scores) {
  return Object.values(scores).reduce((sum, score) => sum + score, 0);
}

function checkHomeDocumentBytes(url) {
  const result = spawnSync(
    "curl",
    ["--compressed", "-fsSo", "/dev/null", "-w", "%{size_download}", url],
    { encoding: "utf-8" },
  );
  const bytes = Number.parseInt(result.stdout, 10);

  if (result.status !== 0 || !Number.isFinite(bytes) || bytes <= 0) {
    console.error(
      `[lighthouse] could not measure the home document: ${result.stderr || result.stdout}`,
    );
    process.exit(1);
  }

  console.log(
    `[lighthouse] home document: ${bytes} bytes compressed (cap ${HOME_DOC_BYTE_CAP}, ${Math.round((bytes / HOME_DOC_BYTE_CAP) * 100)}% of cap)`,
  );

  if (bytes > HOME_DOC_BYTE_CAP) {
    console.error(
      `[lighthouse] home document is ${bytes} bytes compressed, over the ${HOME_DOC_BYTE_CAP}-byte cap. ` +
        "Something new is being inlined into the HTML (inlineCss ships the stylesheet in the document). " +
        "Find it before raising the cap.",
    );
    process.exit(1);
  }
}

function logFailureDiagnostics(reportPath) {
  const report = JSON.parse(readFileSync(reportPath, "utf-8"));
  const metrics = report.audits.metrics?.details?.items?.[0];

  if (metrics) {
    const formatMetric = (value) => `${Math.round(value)}ms`;
    console.error(
      `[lighthouse] metrics: fcp=${formatMetric(metrics.firstContentfulPaint)} lcp=${formatMetric(metrics.largestContentfulPaint)} tbt=${formatMetric(metrics.totalBlockingTime)} si=${formatMetric(metrics.speedIndex)} cls=${metrics.cumulativeLayoutShift}`,
    );
  }

  const opportunities = Object.values(report.audits)
    .filter(
      (audit) =>
        audit.details?.type === "opportunity" &&
        typeof audit.numericValue === "number",
    )
    .sort((left, right) => right.numericValue - left.numericValue)
    .slice(0, 5)
    .map((audit) => `${audit.id}:${Math.round(audit.numericValue)}ms`);

  if (opportunities.length > 0) {
    console.error(
      `[lighthouse] top opportunities: ${opportunities.join(", ")}`,
    );
  }

  const failedAudits = Object.values(report.audits)
    .filter(
      (audit) =>
        audit.score !== null &&
        audit.score < 1 &&
        audit.scoreDisplayMode === "binary",
    )
    .slice(0, 10)
    .map((audit) => audit.id);

  if (failedAudits.length > 0) {
    console.error(
      `[lighthouse] failed binary audits: ${failedAudits.join(", ")}`,
    );
  }

  const layoutShiftItems = report.audits[
    "layout-shift-elements"
  ]?.details?.items
    ?.slice(0, 5)
    .map((item) => {
      const node = item.node ?? {};
      const snippet = node.snippet ?? node.nodeLabel ?? node.path ?? "unknown";
      return `${snippet} (${Math.round((item.score ?? 0) * 1000) / 1000})`;
    });

  if (layoutShiftItems?.length) {
    console.error(
      `[lighthouse] layout-shift-elements: ${layoutShiftItems.join(" | ")}`,
    );
  }
}
