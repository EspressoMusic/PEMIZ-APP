import type { Metadata } from "next";
import "./globals.css";
import { MasterKeyFab } from "@/components/master-key-fab";

export const metadata: Metadata = {
  title: "Linky — עמוד דיגיטלי לעסק שלך",
  description:
    "פלטפורמת SaaS לעסקים קטנים: קישור ללקוחות, הזמנות, תורים ופניות בדשבורד פשוט.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-bakery-scaffold text-bakery-ink"
        suppressHydrationWarning
      >
        <main className="flex-1">{children}</main>
        <MasterKeyFab />
      </body>
    </html>
  );
}
