import type { Metadata } from "next";
import { MarketingPricingPage } from "@/components/marketing/marketing-pricing-page";

const TITLE = "Pricing — Peymiz";
const DESCRIPTION =
  "Simple pricing for small businesses: start with a free trial, upgrade to the monthly plan when you're ready to scale.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    url: "/pricing",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PricingPage() {
  return <MarketingPricingPage />;
}
