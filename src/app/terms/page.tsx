import type { Metadata } from "next";
import { MarketingLegalPage } from "@/components/marketing/marketing-legal-page";

const TITLE = "Terms of Service — Peymiz";
const DESCRIPTION =
  "The terms and conditions for using Peymiz's business dashboard, storefront, and booking tools.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    url: "/terms",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function TermsPage() {
  return <MarketingLegalPage documentId="terms-of-service" />;
}
