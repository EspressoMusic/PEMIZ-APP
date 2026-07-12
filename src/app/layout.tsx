import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import {
  parseLocaleCookie,
  parseThemeCookie,
} from "@/lib/dashboard-appearance-boot";
import { DEFAULT_STORE_THEME } from "@/lib/store-themes";
import { SITE_LOCALE } from "@/lib/site-locale";
import { PwaRoot } from "@/components/pwa/pwa-root";
import { getAppBaseUrl } from "@/lib/app-url";

const SITE_URL = getAppBaseUrl() || "https://peymiz.com";
const SITE_TITLE = "Peymiz — Your business, online";
const SITE_DESCRIPTION =
  "SaaS for small businesses: customer link, orders, appointments, and a simple seller dashboard.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  applicationName: "Peymiz",
  // The he/en toggle is a client-side cookie preference, not separate URLs,
  // so there's nothing distinct to declare via hreflang — only a canonical.
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Peymiz",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/icons/linky-app-logo.png", width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/icons/linky-app-logo.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Peymiz",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/icons/favicon-32.png"],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = parseThemeCookie(
    cookieStore.get("linky-dashboard-theme")?.value
  );
  const locale = parseLocaleCookie(
    cookieStore.get("linky-dashboard-locale")?.value
  ) ?? SITE_LOCALE;

  return (
    <html
      lang={locale}
      dir={locale === "en" ? "ltr" : "rtl"}
      className="h-full overflow-x-hidden antialiased"
      data-store-theme={theme ?? DEFAULT_STORE_THEME}
      data-locale={locale}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-dvh flex-col overflow-x-hidden bg-bakery-scaffold text-bakery-ink"
        suppressHydrationWarning
      >
        <PwaRoot>
          <main className="flex-1">{children}</main>
        </PwaRoot>
      </body>
    </html>
  );
}
