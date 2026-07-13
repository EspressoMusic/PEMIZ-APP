"use client";

import Link from "next/link";
import { MarketingPlanPrice } from "@/components/marketing/marketing-plan-price";
import { MarketingLocaleToggle } from "@/components/marketing/marketing-locale-toggle";
import {
  MarketingLocaleProvider,
  useMarketingLocale,
} from "@/components/marketing/marketing-locale-provider";
import { getSubscriptionPlan } from "@/lib/subscription-plans";
import { marketingWhatsAppUrl } from "@/lib/marketing-contact";
import type { MarketingLocale } from "@/lib/marketing-locale";
import "@/styles/marketing-site.css";
import {
  MarketingPublicFooter,
  MarketingPublicHeader,
} from "@/components/marketing/marketing-public-chrome";
import { marketingPublicPageClassName } from "@/lib/fonts/marketing-fonts";

function pricingCopy(locale: MarketingLocale) {
  if (locale === "he") {
    return {
      eyebrow: "תמחור",
      titleLead: "תמחור פשוט ושקוף.",
      titleEm: "בלי עמלות מרקטפלייס.",
      lead: "Peymiz היא תוכנת SaaS עסקית בלבד. אנחנו לא מרקטפלייס, לא מוכרים מוצרים פיזיים, ולא מעבדים תשלומים בשם הלקוחות שלכם. אתם אחראים למוצרים, לשירותים, ללקוחות, להזמנות, להחזרים, למסים ולציות לחוק.",
      planName: "תוכנית פרימיום",
      period: "/ לחודש",
      features: (orderLimit: number) => [
        "גישה לדשבורד Peymiz",
        "הזמנות לקוחות, תורים והודעות",
        "עמוד עסקי אחד וקישור לשיתוף",
        `עד ${orderLimit} הזמנות בחודש`,
        "כלי תוכנה בלבד — אתם מנהלים את העסק",
      ],
      subscribe: "להרשמה",
      trial: "14 יום ניסיון חינם",
      note: "המנוי מתחדש מדי חודש עד לביטול. ייתכנו מסים נוספים. המחירים עשויים להשתנות בעתיד בהודעה מראש.",
      enterpriseName: "עסקים גדולים",
      enterpriseDescription:
        "נפח הזמנות גבוה, כמה אנשי צוות, או צורך מותאם אישית? בואו נדבר על תוכנית שמתאימה לעסק שלכם.",
      contactUs: "יצירת קשר",
    };
  }
  return {
    eyebrow: "Pricing",
    titleLead: "Simple software pricing.",
    titleEm: "No marketplace fees.",
    lead: "Peymiz is B2B SaaS software only. We are not a marketplace, we do not sell physical goods, and we do not process payments on behalf of your customers. You are responsible for your products, services, customers, orders, refunds, taxes, and legal compliance.",
    planName: "Premium Plan",
    period: "/ month",
    features: (orderLimit: number) => [
      "Access to the Peymiz dashboard",
      "Customer orders, appointments & messages",
      "One business page and shareable link",
      `Up to ${orderLimit} orders per month`,
      "Software tools only — you run your business",
    ],
    subscribe: "Subscribe",
    trial: "14-day free trial",
    note: "Subscription renews monthly until cancelled. Taxes may apply. Prices may change in the future with notice.",
    enterpriseName: "Enterprise",
    enterpriseDescription:
      "High order volume, multiple staff, or custom needs? Let's talk about a plan that fits your business.",
    contactUs: "Contact us",
  };
}

function PricingContent() {
  const { locale, toggleLocale, copy: siteCopy } = useMarketingLocale();
  const t = pricingCopy(locale);
  const plan = getSubscriptionPlan("premium");
  const contactHref = marketingWhatsAppUrl(locale);

  return (
    <div
      className={marketingPublicPageClassName()}
      data-theme="light"
      lang={locale === "he" ? "he" : "en"}
      dir={locale === "he" ? "rtl" : "ltr"}
      style={{ cursor: "auto", minHeight: "100dvh" }}
    >
      <MarketingPublicHeader />

      <section className="pricing public-pricing-section" style={{ paddingTop: 120 }}>
        <div className="pricing-glow" aria-hidden="true" />
        <div className="container">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <MarketingLocaleToggle
              locale={locale}
              onToggle={toggleLocale}
              copy={siteCopy}
            />
          </div>
          <div className="section-head">
            <span className="section-eyebrow">{t.eyebrow}</span>
            <h1 className="section-title center">
              {t.titleLead} <em>{t.titleEm}</em>
            </h1>
            <p className="section-lead center public-pricing-lead">{t.lead}</p>
          </div>

          <div className="pricing-grid" style={{ maxWidth: 900, margin: "0 auto" }}>
            <article className="price-card featured">
              <div className="price-badge popular">{t.planName}</div>
              <MarketingPlanPrice planId="premium" locale={locale} period={t.period} />
              <ul className="price-features">
                {t.features(plan.monthlyOrderLimit).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <p className="price-trial">{t.trial}</p>
              <Link href="/seller" prefetch={false} className="btn btn-primary price-btn">
                {t.subscribe}
              </Link>
              <p className="pricing-note public-pricing-note">{t.note}</p>
            </article>

            <article className="price-card">
              <div className="price-badge">{t.enterpriseName}</div>
              <p className="pricing-note" style={{ minHeight: 72 }}>
                {t.enterpriseDescription}
              </p>
              {contactHref ? (
                <a
                  href={contactHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary price-btn"
                >
                  {t.contactUs}
                </a>
              ) : null}
            </article>
          </div>
        </div>
      </section>

      <MarketingPublicFooter />
    </div>
  );
}

export function MarketingPricingPage() {
  return (
    <MarketingLocaleProvider>
      <PricingContent />
    </MarketingLocaleProvider>
  );
}
