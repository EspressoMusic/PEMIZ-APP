import type { Metadata } from "next";
import { MarketingLegalPage } from "@/components/marketing/marketing-legal-page";

const TITLE = "הצהרת נגישות — Peymiz";
const DESCRIPTION =
  "הצהרת הנגישות של Peymiz: המחויבות שלנו, מה בוצע עד כה, וכיצד לדווח על בעיית נגישות.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/accessibility" },
  openGraph: {
    type: "website",
    url: "/accessibility",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function AccessibilityPage() {
  return <MarketingLegalPage documentId="accessibility-statement" />;
}
