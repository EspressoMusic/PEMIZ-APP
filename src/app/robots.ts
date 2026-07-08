import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const base = getAppBaseUrl() || "https://peymiz.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/",
        "/admin",
        "/master",
        "/api/",
        "/dev",
        "/dev/",
        "/app/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/pending-approval",
        "/trial-expired",
        "/paddle-checkout",
        "/preview/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
