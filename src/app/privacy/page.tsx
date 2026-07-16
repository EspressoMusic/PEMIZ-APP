import type { Metadata } from "next";
import { MarketingLegalPage } from "@/components/marketing/marketing-legal-page";

const TITLE = "Privacy Policy — Peymiz";
const DESCRIPTION =
  "How Peymiz collects, uses, and protects your data as a B2B SaaS platform for small businesses.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: "/privacy",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PrivacyPage() {
  return <MarketingLegalPage documentId="privacy-policy" />;
}
