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

const SITE_COPY = {
  en: {
    title: "Peymiz — Online Store & Appointment Booking for Small Businesses",
    description:
      "Peymiz gives small businesses one shareable link for their online store, orders, and appointment booking, plus a simple seller dashboard. Start a free 14-day trial.",
  },
  he: {
    title: "Peymiz — קישור אחד לניהול הזמנות ותורים לעסק שלך",
    description:
      "Peymiz היא מערכת לעסקים קטנים: עמוד עסקי, קישור אחד לשיתוף, ניהול הזמנות ותורים, ולוח בקרה פשוט לבעל העסק. 14 יום ניסיון חינם.",
  },
} as const;

async function resolveSiteLocale() {
  const cookieStore = await cookies();
  return (
    parseLocaleCookie(cookieStore.get("linky-dashboard-locale")?.value) ??
    SITE_LOCALE
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveSiteLocale();
  const { title, description } = SITE_COPY[locale];

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
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
      locale: locale === "he" ? "he_IL" : "en_US",
      title,
      description,
      images: [{ url: "/icons/linky-app-logo.png", width: 1024, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
}

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
  const locale = await resolveSiteLocale();

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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[999] focus:rounded-full focus:bg-bakery-ink focus:px-4 focus:py-2 focus:text-bakery-scaffold focus:shadow-lg"
        >
          {locale === "he" ? "דלג לתוכן הראשי" : "Skip to main content"}
        </a>
        <PwaRoot>
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </PwaRoot>
      </body>
    </html>
  );
}
