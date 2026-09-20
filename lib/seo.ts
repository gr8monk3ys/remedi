import type { Metadata } from "next";

/**
 * Per-page SEO metadata.
 *
 * `path` is required, and it is the entire point of this helper.
 *
 * Next.js merges metadata from the root layout downwards, and it inherits
 * `alternates.canonical` *verbatim* — it is not rewritten per route. The root
 * layout declared `canonical: "/"` (and `openGraph.url: "/"`), so every page
 * on the site shipped the homepage as its canonical URL:
 *
 *     https://remedi.vivancedata.com/pricing
 *       -> <link rel="canonical" href="https://remedi.vivancedata.com"/>
 *
 * That is not cosmetic. It asks Google to drop /pricing, /about, /faq and
 * /compare from the index in favour of the homepage, and Lighthouse scores it
 * `canonical: 0` ("Points to the domain's root URL (the homepage), instead of
 * an equivalent page of content") — the single failing audit behind the SEO 92
 * measured on production /pricing.
 *
 * Paths stay relative on purpose: Next resolves them against `metadataBase`
 * (lib/url.ts `getBaseUrl()`), so the rendered tag is absolute and sits on
 * whichever origin actually served the page.
 *
 * A page that does not use this helper inherits no canonical at all, which is
 * merely missing rather than actively wrong — the layout no longer declares
 * one. New public pages should still call this.
 */
export type PageMetadataInput = {
  /** This page's own path, rooted at `/` (e.g. `/pricing`). */
  path: string;
  title?: string;
  description?: string;
  /** Shallow overrides on top of the shared Open Graph defaults. */
  openGraph?: { title?: string; description?: string };
};

const SITE_NAME = "Remedi";

export function pageMetadata({
  path,
  title,
  description,
  openGraph,
}: PageMetadataInput): Metadata {
  if (!path.startsWith("/")) {
    throw new Error(
      `pageMetadata: path must start with "/" so it resolves against metadataBase, got "${path}"`,
    );
  }

  return {
    ...(title === undefined ? {} : { title }),
    ...(description === undefined ? {} : { description }),
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      url: path,
      ...(title === undefined ? {} : { title }),
      ...(description === undefined ? {} : { description }),
      ...openGraph,
    },
  };
}
