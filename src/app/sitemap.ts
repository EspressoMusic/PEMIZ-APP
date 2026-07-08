import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl } from "@/lib/app-url";
import { DEMO_STORE_SLUGS } from "@/lib/demo-store-slugs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppBaseUrl() || "https://peymiz.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/seller`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund`, changeFrequency: "yearly", priority: 0.3 },
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
