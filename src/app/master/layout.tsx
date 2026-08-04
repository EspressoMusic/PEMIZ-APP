import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peymiz — פאנל ניהול",
  manifest: "/manifest-master.webmanifest",
  applicationName: "Peymiz Admin",
  appleWebApp: {
    capable: true,
    title: "ניהול Peymiz",
    statusBarStyle: "default",
  },
};

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
