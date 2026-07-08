import { MarketingSite } from "@/components/marketing/marketing-site";
import { getAppBaseUrl } from "@/lib/app-url";

export default function HomePage() {
  const base = getAppBaseUrl() || "https://peymiz.com";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Peymiz",
    url: base,
    logo: `${base}/icons/linky-app-logo.png`,
    description:
      "SaaS for small businesses: customer link, orders, appointments, and a simple seller dashboard.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MarketingSite />
    </>
  );
}
