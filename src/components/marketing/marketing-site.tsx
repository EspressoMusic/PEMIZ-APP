"use client";

import Image from "next/image";
import Link from "next/link";
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
  } = useMarketingSiteEffects();

  return (
    <div
      ref={rootRef}
      className={`marketing-site ${marketingSiteFontClass(locale)}`}
      data-theme={theme}
      lang={locale === "he" ? "he" : "en"}
      dir={locale === "he" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
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
              scrollToSection("home");
            }}
          >
            <span className="logo-mark">
              <Image
                src="/marketing/logo-transparent.png"
                alt="BiziLink"
                width={40}
                height={40}
                className="logo-img"
              />
            </span>
            <span className="logo-text">
              Bizi<span>Link</span>
            </span>
          </a>

          <nav className="nav-links" id="navLinks">
            {navItems.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={activeSection === id ? "active" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(id);
                }}
              >
                {label}
              </a>
            ))}
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
            <button
              type="button"
              className="btn btn-primary nav-cta"
              id="startBtn"
              onClick={() => scrollToSection("pricing")}
            >
              {copy.startPilot}
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
                alt="BiziLink"
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
              <button
                type="button"
                className="btn btn-primary btn-big"
                onClick={() => scrollToSection("pricing")}
              >
                <span>{copy.startPilot}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => scrollToSection("contact")}
              >
                {copy.contactUs}
              </button>
            </div>
          </div>

          <div className="hero-visual" data-reveal="scale">
            <div className="hero-logo-wrap" id="heroLogoWrap">
              <Image
                src="/marketing/hero-logo-transparent.png"
                alt="BiziLink logo"
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
          <div className="pricing-grid pricing-grid--three">
            <article className="price-card featured" data-reveal="scale" data-tilt>
              <div className="price-badge popular">{copy.pilotBadge}</div>
              <div className="price-amount price-free">
                <strong>{copy.pilotFree}</strong>
                <span className="period">{copy.pilotPeriod}</span>
              </div>
              <ul className="price-features">
                {copy.pilotFeatures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="/seller" prefetch={false} className="btn btn-primary price-btn">
                {copy.joinPilot}
              </Link>
            </article>
            <article className="price-card" data-reveal="scale" data-tilt>
              <div className="price-badge">{copy.premiumBadge}</div>
              <div className="price-amount">
                <span className="currency">$</span>
                <strong>49</strong>
                <span className="period">{copy.premiumPeriod}</span>
              </div>
              <ul className="price-features">
                {copy.premiumFeatures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="/seller" prefetch={false} className="btn btn-primary price-btn">
                {copy.getPremium}
              </Link>
            </article>
            <article className="price-card" data-reveal="scale" data-tilt>
              <div className="price-badge">{copy.ultimateBadge}</div>
              <div className="price-amount">
                <span className="currency">$</span>
                <strong>89</strong>
                <span className="period">{copy.ultimatePeriod}</span>
              </div>
              <ul className="price-features">
                {copy.ultimateFeatures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="/seller" prefetch={false} className="btn btn-primary price-btn">
                {copy.getUltimate}
              </Link>
            </article>
          </div>
          <p className="pricing-note" data-reveal>
            {copy.pricingNote}
          </p>
        </div>
      </section>

      <section className="app-cta-section" aria-label="Open BiziLink app">
        <div className="container">
          <div className="app-cta-inner" data-reveal="scale">
            <Link href="/seller" prefetch={false} className="app-cta-link">
              <Image
                src="/marketing/logo-transparent.png"
                alt="Open BiziLink app"
                width={120}
                height={120}
                className="app-cta-logo"
              />
              <span className="app-cta-caption">
                <svg className="app-cta-arrow" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
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

            <div className="contact-channels">
              <a href="mailto:hello@bizilink.app" className="contact-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                {copy.email}
              </a>
              <a href="https://wa.me/" className="contact-btn" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.463 3.67 1.28 5.24L2 22l4.88-1.28A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
                {copy.whatsapp}
              </a>
            </div>
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
