import type { Metadata } from "next";
import { MarketingPricingPage } from "@/components/marketing/marketing-pricing-page";
import { getAppBaseUrl } from "@/lib/app-url";
import { getSubscriptionPlan } from "@/lib/subscription-plans";

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
  const base = getAppBaseUrl() || "https://peymiz.com";
  const premium = getSubscriptionPlan("premium");

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Peymiz",
    description: DESCRIPTION,
    brand: { "@type": "Brand", name: "Peymiz" },
    url: `${base}/pricing`,
    offers: [
      {
        "@type": "Offer",
        name: "Premium",
        price: premium.priceUsd,
        priceCurrency: "USD",
        url: `${base}/pricing`,
        description: "Monthly subscription with a 14-day free trial",
      },
      {
        "@type": "Offer",
        name: "Enterprise",
        url: `${base}/pricing`,
        description:
          "Custom pricing for businesses with high order volume or multiple locations",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MarketingPricingPage />
    </>
  );
}
