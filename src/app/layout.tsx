import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import {
  parseLocaleCookie,
  parseThemeCookie,
} from "@/lib/dashboard-appearance-boot";
import { PwaRoot } from "@/components/pwa/pwa-root";

export const metadata: Metadata = {
  title: "Linky — Your business, online",
  description:
    "SaaS for small businesses: customer link, orders, appointments, and a simple seller dashboard.",
  manifest: "/manifest.webmanifest",
  applicationName: "Linky",
  appleWebApp: {
    capable: true,
    title: "Linky",
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
  );

  return (
    <html
      lang={locale ?? "en"}
      dir={locale === "he" ? "rtl" : "ltr"}
      className="h-full overflow-x-hidden antialiased"
      data-store-theme={theme ?? undefined}
      data-locale={locale ?? undefined}
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
