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
import { MarketingWhatsAppCta } from "./marketing-whatsapp-cta";

const BENEFIT_ICONS = [
  (
    <svg key="1" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  (
    <svg key="2" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  (
    <svg key="3" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  (
    <svg key="4" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  (
    <svg key="5" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  (
    <svg key="6" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
];

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
    handleContactSubmit,
    formSent,
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
                alt="Peymiz"
                width={520}
                height={120}
                className="hero-wordmark"
                priority
              />
            </h1>
            <p className="hero-tagline" data-reveal="left">
              {copy.heroTagline}
            </p>
            <p className="hero-sub" data-reveal="left">
              {copy.heroSub}
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
            <p className="section-lead center" data-reveal>
              {copy.productLead}
            </p>
          </div>

          <div className="benefits-grid">
            {copy.benefits.map((b, i) => (
              <article key={b.title} className="benefit-card" data-reveal="scale" data-tilt>
                <div className="benefit-icon">{BENEFIT_ICONS[i]}</div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </article>
            ))}
          </div>
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
            <span className="section-eyebrow light">{copy.eyebrowContact}</span>
            <h2 className="section-title light">
              {copy.contactTitle} <em>{copy.contactTitleEm}</em>
            </h2>
            <p className="contact-lead">{copy.contactLead}</p>

            <MarketingWhatsAppCta locale={locale} label={copy.whatsappMegaCta} />
          </div>

          <form className="contact-form" data-reveal="right" onSubmit={handleContactSubmit}>
            <label>
              <span>{copy.formName}</span>
              <input type="text" name="name" placeholder={copy.formNamePlaceholder} required />
            </label>
            <label>
              <span>{copy.formEmail}</span>
              <input type="email" name="email" placeholder={copy.formEmailPlaceholder} required />
            </label>
            <label>
              <span>{copy.formMessage}</span>
              <textarea name="message" rows={4} placeholder={copy.formMessagePlaceholder} required />
            </label>
            <button className="btn btn-primary btn-big" type="submit">
              {formSent ? copy.messageSent : copy.sendMessage}
            </button>
          </form>
        </div>
      </section>

      <MarketingPublicFooter />

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
