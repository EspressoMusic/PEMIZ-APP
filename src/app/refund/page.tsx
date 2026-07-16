import type { Metadata } from "next";
import { MarketingLegalPage } from "@/components/marketing/marketing-legal-page";

const TITLE = "Refund & Cancellation Policy — Peymiz";
const DESCRIPTION =
  "Peymiz's subscription refund and cancellation policy for business owners.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/refund" },
  openGraph: {
    type: "website",
    url: "/refund",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RefundPage() {
  return <MarketingLegalPage documentId="refund-cancellation-policy" />;
}
