import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import { getBaseUrl } from "@/lib/url";

const logger = createLogger("sitemap");

/**
 * Generates sitemap.xml for search engines
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Static pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    // Fetch all natural remedies from database
    const remedies = await prisma.naturalRemedy.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Add remedy pages to sitemap
    const remedyRoutes: MetadataRoute.Sitemap = remedies.map(
      (remedy: { id: string; updatedAt: Date }) => ({
        url: `${baseUrl}/remedy/${remedy.id}`,
        lastModified: remedy.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    );

    routes.push(...remedyRoutes);
  } catch (error) {
    logger.error("Error generating sitemap", error);
    // Continue with static pages only if database query fails
  }

  return routes;
}

/**
 * Revalidate sitemap every 24 hours
 */
export const dynamic = "force-dynamic";
export const revalidate = 86400; // 24 hours in seconds
