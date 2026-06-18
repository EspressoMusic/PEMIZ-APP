"use client";

import Link from "next/link";
import "@/styles/marketing-site.css";
import {
  MarketingPublicFooter,
  MarketingPublicHeader,
  marketingPublicPageClassName,
} from "@/components/marketing/marketing-public-chrome";

export function MarketingPricingPage() {
  return (
    <div
      className={marketingPublicPageClassName()}
      data-theme="dark"
      lang="en"
      dir="ltr"
      style={{ cursor: "auto", minHeight: "100dvh" }}
    >
      <MarketingPublicHeader />

      <section className="pricing public-pricing-section" style={{ paddingTop: 120 }}>
        <div className="pricing-glow" aria-hidden="true" />
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Pricing</span>
            <h1 className="section-title center">
              Simple software pricing. <em>No marketplace fees.</em>
            </h1>
            <p className="section-lead center public-pricing-lead">
              Peymiz is B2B SaaS software only. We are not a marketplace, we do
              not sell physical goods, and we do not process payments on behalf of
              your customers. You are responsible for your products, services,
              customers, orders, refunds, taxes, and legal compliance.
            </p>
          </div>

          <div className="pricing-grid" style={{ maxWidth: 420, margin: "0 auto" }}>
            <article className="price-card featured">
              <div className="price-badge popular">Basic Plan</div>
              <div className="price-amount">
                <span className="currency">$</span>
                <strong>19</strong>
                <span className="period">/ month</span>
              </div>
              <ul className="price-features">
                <li>Access to the Peymiz dashboard</li>
                <li>Customer orders, appointments &amp; messages</li>
                <li>One business page and shareable link</li>
                <li>Software tools only — you run your business</li>
              </ul>
              <Link href="/seller" prefetch={false} className="btn btn-primary price-btn">
                Subscribe
              </Link>
              <p className="pricing-note public-pricing-note">
                Subscription renews monthly until cancelled. Taxes may apply.
                Prices may change in the future with notice.
              </p>
            </article>
          </div>
        </div>
      </section>

      <MarketingPublicFooter />
    </div>
  );
}
