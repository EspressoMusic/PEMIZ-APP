"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "@/styles/marketing-apple.css";
import { marketingHeebo, marketingInter } from "@/lib/fonts/marketing-fonts";
import { MarketingLocaleToggle } from "./marketing-locale-toggle";
import {
  MarketingLocaleProvider,
  useMarketingLocale,
} from "./marketing-locale-provider";
import { MarketingWhatsAppCta } from "./marketing-whatsapp-cta";
import { useMarketingSiteEffects } from "./use-marketing-site-effects";
import {
  formatPlanPrice,
  getSubscriptionPlan,
  planPrice,
} from "@/lib/subscription-plans";

function AppleChevron() {
  return (
    <svg viewBox="0 0 8 14" fill="none" aria-hidden="true">
      <path
        d="M1 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppleLinkCta({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link href={href} prefetch={false} className="apple-link-cta" onClick={onClick}>
      {children}
      <AppleChevron />
    </Link>
  );
}

export function MarketingSiteApple() {
  return (
    <MarketingLocaleProvider>
      <MarketingSiteAppleContent />
    </MarketingLocaleProvider>
  );
}

function MarketingSiteAppleContent() {
  const { locale, toggleLocale, copy } = useMarketingLocale();
  const [navOpen, setNavOpen] = useState(false);
  const navItems = [
    { id: "home", label: copy.navHome },
    { id: "product", label: copy.navProduct },
    { id: "pricing", label: copy.navPricing },
    { id: "contact", label: copy.navContact },
  ] as const;

  const {
    rootRef,
    activeSection,
    scrollToSection,
    handleContactSubmit,
    formSent,
  } = useMarketingSiteEffects();

  const fontClass = locale === "he" ? marketingHeebo.className : marketingInter.className;
  const heClass = locale === "he" ? "marketing-apple--he" : "";

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  function goToSection(id: string) {
    setNavOpen(false);
    scrollToSection(id);
  }

  const promoTiles = copy.benefits.slice(0, 4);
  const spotlightBenefits = copy.benefits.slice(4, 6);

  return (
    <div
      ref={rootRef}
      className={`marketing-apple ${fontClass} ${heClass}`}
      lang={locale === "he" ? "he" : "en"}
      dir={locale === "he" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <header className="apple-nav">
        <div className="apple-nav-inner">
          <a
            href="#home"
            className="apple-logo"
            onClick={(e) => {
              e.preventDefault();
              goToSection("home");
            }}
          >
            <Image
              src="/marketing/logo-transparent.png"
              alt="Peymiz"
              width={28}
              height={28}
            />
            <span>Peymiz</span>
          </a>

          <nav
            className={`apple-nav-links${navOpen ? " open" : ""}`}
            aria-label="Main"
          >
            {navItems.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={activeSection === id ? "active" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  goToSection(id);
                }}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="apple-nav-actions">
            <MarketingLocaleToggle
              locale={locale}
              onToggle={toggleLocale}
              copy={copy}
              className="apple-nav-btn"
            />
            <Link
              href="/login"
              prefetch={false}
              className="apple-nav-btn apple-nav-btn--primary"
            >
              {copy.signIn}
            </Link>
            <button
              type="button"
              className={`apple-menu-toggle${navOpen ? " open" : ""}`}
              aria-expanded={navOpen}
              aria-label={navOpen ? copy.menuClose : copy.menuOpen}
              onClick={() => setNavOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="apple-hero" id="home">
          <p className="apple-hero-eyebrow" data-reveal>
            Peymiz
          </p>
          <h1 className="apple-hero-title" data-reveal>
            {copy.heroTagline}
          </h1>
          <p className="apple-hero-sub" data-reveal>
            {copy.heroSub}
          </p>
          <div className="apple-hero-cta" data-reveal>
            <AppleLinkCta href="/login">{copy.startPilot}</AppleLinkCta>
            <AppleLinkCta
              href="#product"
              onClick={(e) => {
                e.preventDefault();
                goToSection("product");
              }}
            >
              {copy.learnMore}
            </AppleLinkCta>
          </div>
          <div className="apple-hero-visual" data-reveal>
            <Image
              src="/marketing/hero-logo-transparent.png"
              alt="Peymiz"
              width={520}
              height={520}
              priority
            />
          </div>
        </section>

        <section className="apple-promo-grid" id="product" aria-label={copy.eyebrowProduct}>
          {promoTiles.map((tile, i) => (
            <article
              key={tile.title}
              className={`apple-promo-tile${
                i === 1 ? " apple-promo-tile--dark" : i === 3 ? " apple-promo-tile--soft" : ""
              }`}
              data-reveal
            >
              <p className="apple-promo-kicker">{copy.eyebrowProduct}</p>
              <h2 className="apple-promo-title">{tile.title}</h2>
              <p className="apple-promo-sub">{tile.body}</p>
              <div className="apple-promo-links">
                <AppleLinkCta
                  href="#pricing"
                  onClick={(e) => {
                    e.preventDefault();
                    goToSection("pricing");
                  }}
                >
                  {copy.learnMore}
                </AppleLinkCta>
              </div>
              {i === 0 ? (
                <div className="apple-promo-art">
                  <Image
                    src="/marketing/logo-transparent.png"
                    alt=""
                    width={240}
                    height={240}
                  />
                </div>
              ) : null}
            </article>
          ))}
        </section>

        <section className="apple-spotlight apple-spotlight--soft">
          <p className="apple-spotlight-eyebrow" data-reveal>
            {copy.productTitle}
          </p>
          <h2 className="apple-spotlight-title" data-reveal>
            {copy.productTitle} {copy.productTitleEm}
          </h2>
          <p className="apple-spotlight-sub" data-reveal>
            {copy.productLead}
          </p>
          <div className="apple-benefits-row">
            {spotlightBenefits.map((b) => (
              <article key={b.title} className="apple-benefit" data-reveal>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="apple-spotlight apple-spotlight--dark">
          <p className="apple-spotlight-eyebrow" data-reveal>
            {copy.pricingNote}
          </p>
          <h2 className="apple-spotlight-title" data-reveal>
            {copy.pricingTitle} {copy.pricingTitleEm}
          </h2>
          <div className="apple-hero-cta" data-reveal>
            <AppleLinkCta href="/login">{copy.joinPilot}</AppleLinkCta>
            <AppleLinkCta
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                goToSection("pricing");
              }}
            >
              {copy.navPricing}
            </AppleLinkCta>
          </div>
        </section>

        <section className="apple-pricing" id="pricing">
          <div className="apple-section-head" data-reveal>
            <span className="apple-section-eyebrow">{copy.eyebrowPricing}</span>
            <h2 className="apple-section-title">
              {copy.pricingTitle} {copy.pricingTitleEm}
            </h2>
          </div>

          <div className="apple-pricing-grid">
            <article className="apple-price-card apple-price-card--featured" data-reveal>
              <p className="apple-price-badge">{copy.pilotBadge}</p>
              <p className="apple-price-amount">{copy.pilotFree}</p>
              <p className="apple-price-period">{copy.pilotPeriod}</p>
              <ul className="apple-price-features">
                {copy.pilotFeatures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="/login" prefetch={false} className="apple-price-btn">
                {copy.joinPilot}
              </Link>
            </article>

            <article className="apple-price-card" data-reveal>
              <p className="apple-price-badge">{copy.premiumBadge}</p>
              <p className="apple-price-amount" dir="ltr">
                {formatPlanPrice(
                  planPrice(getSubscriptionPlan("premium"), locale),
                  locale
                )}
              </p>
              <p className="apple-price-period">{copy.premiumPeriod}</p>
              <ul className="apple-price-features">
                {copy.premiumFeatures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="/login" prefetch={false} className="apple-price-btn">
                {copy.getPremium}
              </Link>
            </article>

            <article className="apple-price-card" data-reveal>
              <p className="apple-price-badge">{copy.ultimateBadge}</p>
              <p className="apple-price-amount apple-price-amount--text">
                {copy.enterpriseHeadline}
              </p>
              <p className="apple-price-period">&nbsp;</p>
              <ul className="apple-price-features">
                {copy.ultimateFeatures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link
                href="#contact"
                prefetch={false}
                className="apple-price-btn apple-price-btn--ghost"
                onClick={(e) => {
                  e.preventDefault();
                  goToSection("contact");
                }}
              >
                {copy.getUltimate}
              </Link>
            </article>
          </div>
        </section>

        <section className="apple-contact" id="contact">
          <div className="apple-contact-grid">
            <div className="apple-contact-copy" data-reveal>
              <span className="apple-section-eyebrow">{copy.eyebrowContact}</span>
              <h2>
                {copy.contactTitle} {copy.contactTitleEm}
              </h2>
              <p>{copy.contactLead}</p>
              <MarketingWhatsAppCta locale={locale} label={copy.whatsappMegaCta} />
            </div>

            <form
              className="apple-contact-form"
              data-reveal
              onSubmit={handleContactSubmit}
            >
              <label>
                <span>{copy.formName}</span>
                <input
                  type="text"
                  name="name"
                  placeholder={copy.formNamePlaceholder}
                  required
                />
              </label>
              <label>
                <span>{copy.formEmail}</span>
                <input
                  type="email"
                  name="email"
                  placeholder={copy.formEmailPlaceholder}
                  required
                />
              </label>
              <label>
                <span>{copy.formMessage}</span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder={copy.formMessagePlaceholder}
                  required
                />
              </label>
              <button type="submit" className="apple-price-btn">
                {formSent ? copy.messageSent : copy.sendMessage}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="apple-footer">
        <div className="apple-footer-inner">
          <p className="apple-footer-copy">{copy.footerCopyPeymiz}</p>
          <nav className="apple-footer-nav" aria-label="Legal">
            <Link href="/">{copy.navHome}</Link>
            <Link href="/pricing">{copy.footerPricing}</Link>
            <Link href="/terms">{copy.terms}</Link>
            <Link href="/privacy">{copy.privacy}</Link>
            <Link href="/refund">{copy.refund}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
