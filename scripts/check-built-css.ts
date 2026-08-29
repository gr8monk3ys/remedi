#!/usr/bin/env bun
/**
 * Post-build guard: refuse to ship a stylesheet with no Tailwind utilities in it.
 *
 * Why this exists: remedi's production alias once served a build whose only
 * stylesheet was 28,851 bytes of bare custom properties — every `.flex`,
 * `.grid` and `grid-template-columns` missing — and the site rendered as
 * unstyled HTML for months without anything failing. Byte size alone is not
 * the tell (28KB looks plausible); the absence of the canary utilities is.
 *
 * Usage:
 *   bun run scripts/check-built-css.ts              # scans .next/static
 *   bun run scripts/check-built-css.ts <file.css>   # checks one file (tests)
 *
 * Dependency-free and reads only the largest emitted stylesheet.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** A build this far below the real ~105KB stylesheet is not a real build. */
const MIN_BYTES = 20_000;

/** Utilities every Tailwind build of this app emits. Missing one = no utilities. */
const CANARIES: { label: string; re: RegExp }[] = [
  {
    label: ".flex{display:flex}",
    re: /\.flex\s*\{\s*display\s*:\s*flex\s*[;}]/,
  },
  {
    label: ".grid{display:grid}",
    re: /\.grid\s*\{\s*display\s*:\s*grid\s*[;}]/,
  },
  { label: "grid-template-columns", re: /grid-template-columns/ },
];

function collectCss(dir: string): string[] {
  let out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(collectCss(full));
    else if (entry.name.endsWith(".css")) out.push(full);
  }
  return out;
}

function fail(message: string): never {
  console.error(`✗ built CSS check FAILED: ${message}`);
  process.exit(1);
}

const explicit = process.argv[2];
let target: string;

if (explicit) {
  target = explicit;
} else {
  const root = ".next/static";
  let files: string[];
  try {
    files = collectCss(root);
  } catch {
    fail(`${root} does not exist — run \`next build\` first.`);
  }
  if (files.length === 0) fail(`no .css emitted under ${root}.`);
  files.sort((a, b) => statSync(b).size - statSync(a).size);
  target = files[0];
}

const bytes = statSync(target).size;
const css = readFileSync(target, "utf8");
const missing = CANARIES.filter((c) => !c.re.test(css)).map((c) => c.label);

if (bytes < MIN_BYTES) {
  fail(
    `${target} is ${bytes.toLocaleString()} bytes, below the ${MIN_BYTES.toLocaleString()}-byte floor. ` +
      `Tailwind almost certainly produced no utilities.`,
  );
}

if (missing.length > 0) {
  fail(
    `${target} (${bytes.toLocaleString()} bytes) is missing canary utilities: ${missing.join(", ")}. ` +
      `The stylesheet shipped without Tailwind utilities — the site would render unstyled.`,
  );
}

console.log(
  `✓ built CSS ok: ${target} (${bytes.toLocaleString()} bytes), all ${CANARIES.length} canary utilities present.`,
);
