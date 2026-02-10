import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/url";

/**
 * Generates robots.txt file for search engine crawlers
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/"],
      },
      {
        userAgent: "GPTBot", // OpenAI's crawler
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      {
        userAgent: "CCBot", // Common Crawl bot
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai", // Claude's crawler
        disallow: "/",
      },
      {
        userAgent: "Claude-Web", // Claude web crawler
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
