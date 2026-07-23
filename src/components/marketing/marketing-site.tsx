"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "@/styles/marketing-site.css";
import { marketingSiteFontClass } from "@/lib/fonts/marketing-fonts";
import { useMarketingSiteEffects } from "./use-marketing-site-effects";
import { MarketingLocaleToggle } from "./marketing-locale-toggle";
import {
  MarketingPublicFooter,
} from "./marketing-public-chrome";
import {
  MarketingLocaleProvider,
  useMarketingLocale,
} from "./marketing-locale-provider";
import { MarketingSideConfetti } from "./marketing-side-confetti";
import { MarketingPlanPrice } from "./marketing-plan-price";
import { MarketingContactPhoneCard } from "./marketing-contact-phone-card";
import { MarketingWhatsAppCta } from "./marketing-whatsapp-cta";
import { MarketingUsageFlow } from "./marketing-usage-flow";
import { MarketingUsageDemo } from "./marketing-usage-demo";

export function MarketingSite() {
  return (
    <MarketingLocaleProvider>
      <MarketingSiteContent />
    </MarketingLocaleProvider>
  );
}

function MarketingSiteContent() {
  const { locale, toggleLocale, copy } = useMarketingLocale();
  const [navOpen, setNavOpen] = useState(false);
  const navItems = [
    { id: "home", label: copy.navHome },
    { id: "product", label: copy.navProduct },
    { id: "pricing", label: copy.navPricing },
    { id: "faq", label: copy.navFaq },
    { id: "contact", label: copy.navContact },
  ] as const;
  const {
    rootRef,
    theme,
    toggleTheme,
    loaderGone,
    backTopVisible,
    navbarScrolled,
    scrollProgress,
    activeSection,
    scrollToSection,
    footerConfettiActive,
    footerConfettiBurst,
  } = useMarketingSiteEffects();

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  function goToSection(id: string) {
    setNavOpen(false);
    scrollToSection(id);
  }

  return (
    <div
      ref={rootRef}
      className={`marketing-site ${marketingSiteFontClass(locale)}`}
      data-theme={theme}
      lang={locale === "he" ? "he" : "en"}
      dir={locale === "he" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <MarketingSideConfetti
        active={footerConfettiActive}
        burst={footerConfettiBurst}
      />
      <div
        className="scroll-progress"
        id="scrollProgress"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className={`loader${loaderGone ? " gone" : ""}`} id="loader">
        <div className="loader-inner">
          <div className="loader-mark">
            <div className="loader-ring" aria-hidden="true" />
            <Image
              src="/marketing/hero-logo-transparent.png"
              alt=""
              width={120}
              height={120}
              className="loader-logo"
              priority
            />
          </div>
          <p className="loader-text">{copy.loading}</p>
        </div>
      </div>

      <div className="particles-bg" aria-hidden="true">
        {["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"].map((p) => (
          <span key={p} className={`particle ${p}`} />
        ))}
      </div>

      <header className={`navbar${navbarScrolled ? " scrolled" : ""}`} id="navbar">
        <div className="container nav-inner">
          <a
            href="#home"
            className="logo"
            onClick={(e) => {
              e.preventDefault();
              goToSection("home");
            }}
          >
            <span className="logo-mark">
              <Image
                src="/marketing/logo-transparent.png"
                alt="Peymiz"
                width={40}
                height={40}
                className="logo-img"
              />
            </span>
            <span className="logo-text">Peymiz</span>
          </a>

          {navOpen ? (
            <button
              type="button"
              className="nav-backdrop"
              aria-label={copy.menuClose}
              onClick={() => setNavOpen(false)}
            />
          ) : null}

          <nav
            className={`nav-links${navOpen ? " open" : ""}`}
            id="navLinks"
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
            <Link
              href="/login"
              prefetch={false}
              className="btn btn-primary nav-cta-mobile"
              onClick={() => setNavOpen(false)}
            >
              {copy.signIn}
            </Link>
          </nav>

          <div className="nav-actions">
            <MarketingLocaleToggle
              locale={locale}
              onToggle={toggleLocale}
              copy={copy}
            />
            <button
              type="button"
              className="theme-toggle"
              id="themeToggle"
              aria-label={copy.toggleTheme}
              onClick={toggleTheme}
            >
              <svg className="icon-sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
              <svg className="icon-moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            <Link
              href="/login"
              prefetch={false}
              className="btn btn-primary nav-cta"
            >
              {copy.signIn}
            </Link>
            <button
              type="button"
              className={`menu-toggle${navOpen ? " open" : ""}`}
              aria-expanded={navOpen}
              aria-controls="navLinks"
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

      <section className="hero" id="home">
        <div className="hero-waves">
          <svg className="wave wave-left" viewBox="0 0 600 800" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,0 C160,120 60,300 140,460 C220,620 80,720 0,800 L0,0 Z" />
            <path d="M0,0 C120,140 30,320 110,500 C190,660 50,760 0,800 L0,0 Z" />
          </svg>
          <svg className="wave wave-right" viewBox="0 0 700 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M700,0 C520,120 640,260 560,420 C480,580 620,720 700,900 L700,0 Z" />
            <path d="M700,40 C540,160 660,300 580,460 C500,620 640,760 700,900 L700,40 Z" />
            <path d="M700,80 C560,200 680,340 600,500 C520,660 660,800 700,900 L700,80 Z" />
          </svg>
        </div>

        <div className="dots">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        <div className="container hero-grid">
          <div className="hero-content">
            <h1 className="hero-brand" data-reveal="left">
              <Image
                src="/marketing/wordmark.png"
                alt={`Peymiz — ${copy.heroTagline}`}
                width={520}
                height={120}
                className="hero-wordmark"
                priority
              />
            </h1>
            <p className="hero-tagline" data-reveal="left">
              {copy.heroTagline}
            </p>

            <div className="hero-cta" data-reveal="left">
              <Link href="/login" prefetch={false} className="btn btn-primary btn-big btn-hero-cta">
                {copy.startTrial}
              </Link>
            </div>
          </div>

          <div className="hero-visual" data-reveal="scale">
            <div className="hero-logo-wrap" id="heroLogoWrap">
              <Image
                src="/marketing/hero-logo-transparent.png"
                alt="Peymiz logo"
                width={480}
                height={480}
                className="hero-logo-giant"
                id="heroLogoGiant"
                priority
              />
            </div>
          </div>
        </div>

        <a
          href="#product"
          className="scroll-indicator"
          aria-label="Scroll down"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("product");
          }}
        >
          <div className="mouse">
            <div className="wheel" />
          </div>
          <span>{copy.scroll}</span>
        </a>
      </section>

      <section className="product" id="product">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow" data-reveal="scale">
              {copy.eyebrowProduct}
            </span>
            <h2 className="section-title center" data-reveal="scale">
              {copy.productTitle} <em>{copy.productTitleEm}</em>
            </h2>
            <p className="section-lead center" data-reveal="scale">
              {copy.productLead}
            </p>
          </div>

          <MarketingUsageFlow steps={copy.usageSteps} />
          <MarketingUsageDemo />
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="pricing-glow" aria-hidden="true" />
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow" data-reveal="scale">
              {copy.eyebrowPricing}
            </span>
            <h2 className="section-title center" data-reveal="scale">
              {copy.pricingTitle} <em>{copy.pricingTitleEm}</em>
            </h2>
          </div>
          <div className="pricing-grid pricing-grid--two">
            <article className="price-card price-card--gold" data-reveal="scale" data-tilt>
              <div className="price-badge">{copy.premiumBadge}</div>
              <MarketingPlanPrice
                planId="premium"
                locale={locale}
                period={copy.premiumPeriod}
              />
              <ul className="price-features">
                {copy.premiumFeatures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="price-trial">{copy.premiumTrial}</p>
              <Link href="/login" prefetch={false} className="btn btn-primary price-btn">
                {copy.getPremium}
              </Link>
            </article>
            <article className="price-card" data-reveal="scale" data-tilt>
              <div className="price-badge">{copy.ultimateBadge}</div>
              <div className="price-amount price-free">
                <strong>{copy.enterpriseHeadline}</strong>
              </div>
              <ul className="price-features">
                {copy.ultimateFeatures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="#contact" prefetch={false} className="btn btn-primary price-btn">
                {copy.getUltimate}
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow" data-reveal="scale">
              {copy.eyebrowFaq}
            </span>
            <h2 className="section-title center" data-reveal="scale">
              {copy.faqTitle} <em>{copy.faqTitleEm}</em>
            </h2>
          </div>
          <div className="faq-list">
            {copy.faq.map((item, i) => (
              <details
                key={item.question}
                className="faq-item"
                data-reveal="scale"
                open={i === 0}
              >
                <summary className="faq-question">
                  {item.question}
                  <svg
                    className="faq-chevron"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p className="faq-answer">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="app-cta-section" aria-label="Open Peymiz app">
        <div className="container">
          <div className="app-cta-inner" data-reveal="scale">
            <Link href="/login" prefetch={false} className="app-cta-link">
              <Image
                src="/marketing/logo-transparent.png"
                alt="Open Peymiz app"
                width={180}
                height={180}
                className="app-cta-logo"
              />
              <span className="app-cta-caption">
                <svg className="app-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
                <span className="app-cta-label">{copy.tryNow}</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="container contact-grid">
          <div className="contact-copy" data-reveal="left">
            <h2 className="section-title light">
              {copy.contactTitle} <em>{copy.contactTitleEm}</em>
            </h2>
            <p className="contact-lead">{copy.demoBookLead}</p>
          </div>

          <MarketingContactPhoneCard locale={locale} copy={copy} />
        </div>
      </section>

      <MarketingPublicFooter />

      <MarketingWhatsAppCta
        locale={locale}
        label={copy.whatsappMegaCta}
        floating
      />

      <button
        type="button"
        className={`back-top${backTopVisible ? " show" : ""}`}
        id="backTop"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </button>
    </div>
  );
}
