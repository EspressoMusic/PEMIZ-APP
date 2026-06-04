import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import {
  DASHBOARD_APPEARANCE_BOOT_SCRIPT,
  parseLocaleCookie,
  parseThemeCookie,
} from "@/lib/dashboard-appearance-boot";

export const metadata: Metadata = {
  title: "Linky — עמוד דיגיטלי לעסק שלך",
  description:
    "פלטפורמת SaaS לעסקים קטנים: קישור ללקוחות, הזמנות, תורים ופניות בדשבורד פשוט.",
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
      lang={locale ?? "he"}
      dir={locale === "en" ? "ltr" : "rtl"}
      className="h-full overflow-x-hidden antialiased"
      data-store-theme={theme ?? undefined}
      data-locale={locale ?? undefined}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: DASHBOARD_APPEARANCE_BOOT_SCRIPT,
          }}
        />
      </head>
      <body
        className="flex min-h-dvh flex-col overflow-x-hidden bg-bakery-scaffold text-bakery-ink"
        suppressHydrationWarning
      >
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
