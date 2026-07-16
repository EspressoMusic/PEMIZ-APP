import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl } from "@/lib/app-url";
import { DEMO_STORE_SLUGS } from "@/lib/demo-store-slugs";

/** Last time the static marketing pages' content changed. */
const STATIC_CONTENT_UPDATED_AT = new Date("2026-07-16");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppBaseUrl() || "https://peymiz.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: STATIC_CONTENT_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/pricing`,
      lastModified: STATIC_CONTENT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/seller`,
      lastModified: STATIC_CONTENT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/privacy`,
      lastModified: STATIC_CONTENT_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: STATIC_CONTENT_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/refund`,
      lastModified: STATIC_CONTENT_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/accessibility`,
      lastModified: STATIC_CONTENT_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const businesses = await prisma.business.findMany({
    where: {
      isActive: true,
      slug: { notIn: [...DEMO_STORE_SLUGS] },
    },
    select: { slug: true, createdAt: true },
  });

  const storeRoutes: MetadataRoute.Sitemap = businesses.map((b) => ({
    url: `${base}/b/${b.slug}`,
    lastModified: b.createdAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...storeRoutes];
}
