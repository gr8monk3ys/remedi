import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { pageMetadata } from "@/lib/seo";
import { PRODUCTION_URL } from "@/lib/url";

describe("pageMetadata", () => {
  it("canonicalises a page to its own path, not the site root", () => {
    const metadata = pageMetadata({ path: "/pricing", title: "Pricing" });

    expect(metadata.alternates?.canonical).toBe("/pricing");
    // Relative on purpose: Next resolves it against metadataBase, which is
    // getBaseUrl(). On production that is the custom domain.
    expect(new URL("/pricing", PRODUCTION_URL).toString()).toBe(
      `${PRODUCTION_URL}/pricing`,
    );
  });

  it("points openGraph.url at the same page as the canonical", () => {
    const metadata = pageMetadata({ path: "/about" });
    const openGraph = metadata.openGraph as { url?: string } | undefined;

    expect(openGraph?.url).toBe("/about");
    expect(openGraph?.url).toBe(metadata.alternates?.canonical);
  });

  it("keeps the shared Open Graph defaults while letting a page override them", () => {
    const metadata = pageMetadata({
      path: "/interactions",
      title: "Drug Interaction Checker",
      openGraph: { title: "Drug Interaction Checker - Remedi" },
    });
    const openGraph = metadata.openGraph as {
      siteName?: string;
      locale?: string;
      title?: string;
    };

    expect(openGraph.siteName).toBe("Remedi");
    expect(openGraph.locale).toBe("en_US");
    expect(openGraph.title).toBe("Drug Interaction Checker - Remedi");
  });

  it("rejects a path that would not resolve against metadataBase", () => {
    expect(() => pageMetadata({ path: "pricing" })).toThrow(/must start with/);
  });
});

/**
 * The bug this file exists for: `alternates.canonical` declared in a layout is
 * inherited verbatim by every route beneath it, so /pricing, /about, /faq and
 * /compare all told search engines their canonical URL was the homepage. A
 * layout is structurally incapable of knowing which route is rendering, so no
 * layout may declare a canonical URL or an `openGraph.url`.
 */
describe("app layouts", () => {
  const appDir = join(process.cwd(), "app");

  function layoutFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) return layoutFiles(path);
      return entry === "layout.tsx" ? [path] : [];
    });
  }

  it.each(layoutFiles(appDir))(
    "%s declares no canonical URL of its own",
    (path) => {
      const source = readFileSync(path, "utf-8")
        .split("\n")
        .filter((line) => !line.trim().startsWith("//"))
        .join("\n");

      expect(source).not.toMatch(/canonical\s*:/);
      expect(source).not.toMatch(/^\s*url\s*:/m);
    },
  );
});
