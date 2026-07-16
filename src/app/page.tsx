import { MarketingSite } from "@/components/marketing/marketing-site";
import { getAppBaseUrl } from "@/lib/app-url";
import { MARKETING_COPY } from "@/lib/marketing-locale";
import { getSubscriptionPlan } from "@/lib/subscription-plans";

const SITE_DESCRIPTION =
  "Peymiz gives small businesses one shareable link for their online store, orders, and appointment booking, plus a simple seller dashboard.";

export default function HomePage() {
  const base = getAppBaseUrl() || "https://peymiz.com";
  const plan = getSubscriptionPlan("premium");

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Peymiz",
    url: base,
    logo: `${base}/icons/linky-app-logo.png`,
    description: SITE_DESCRIPTION,
  };

  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Peymiz",
    url: base,
    description: SITE_DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: plan.priceUsd,
      priceCurrency: "USD",
      description: "Monthly subscription with a 14-day free trial",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: MARKETING_COPY.en.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MarketingSite />
    </>
  );
}
