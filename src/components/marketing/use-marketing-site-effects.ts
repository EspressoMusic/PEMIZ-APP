"use client";

import { useEffect, useRef, useState } from "react";

const FOOTER_CONFETTI_MS = 4200;

export function useMarketingSiteEffects() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [loaderGone, setLoaderGone] = useState(false);
  const [backTopVisible, setBackTopVisible] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  const [formSent, setFormSent] = useState(false);
  const [footerConfettiActive, setFooterConfettiActive] = useState(false);
  const [footerConfettiBurst, setFooterConfettiBurst] = useState(0);
  const wasAtBottomRef = useRef(false);
  const confettiTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaderGone(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const heroLogoWrap = root.querySelector<HTMLElement>("#heroLogoWrap");
    const heroVisual = root.querySelector<HTMLElement>(".hero-visual");
    const pricingGlow = root.querySelector<HTMLElement>(".pricing-glow");
    const pricingSection = root.querySelector<HTMLElement>(".pricing");

    const heroParallax = (sy: number) => {
      if (!heroLogoWrap || sy >= window.innerHeight) return;
      if (heroVisual?.matches(":hover")) return;
      heroLogoWrap.style.transform = `translateY(${sy * 0.14}px) rotate(${sy * -0.012}deg)`;
    };

    const pricingParallax = () => {
      if (!pricingGlow || !pricingSection) return;
      const rect = pricingSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        pricingGlow.style.transform = `translateY(${rect.top * 0.12}px)`;
      }
    };

    const onHeroMove = (e: MouseEvent) => {
      if (!heroVisual || !heroLogoWrap) return;
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroLogoWrap.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) scale(1.02)`;
    };
    const onHeroLeave = () => {
      if (heroLogoWrap) heroLogoWrap.style.transform = "";
    };

    heroVisual?.addEventListener("mousemove", onHeroMove);
    heroVisual?.addEventListener("mouseleave", onHeroLeave);

    root.querySelectorAll("[data-tilt]").forEach((card) => {
      const el = card as HTMLElement;
      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${y * -5}deg) translateY(-6px)`;
      };
      const onLeaveCard = () => {
        el.style.transform = "";
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeaveCard);
    });

    const revealTypes = ["left", "right", "scale", "rotate", "blur"];
    const reveals = root.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach((el, i) => {
      const type = el.getAttribute("data-reveal");
      if (type && revealTypes.includes(type)) {
        el.classList.add(`reveal-${type}`);
      }
      el.classList.add(`delay-${(i % 3) + 1}`);
      observer.observe(el);
    });

    root.querySelectorAll(".benefit-card").forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${i * 0.08}s`;
    });
    root.querySelectorAll(".price-card").forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${i * 0.15}s`;
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      },
      { threshold: 0.15 }
    );
    root.querySelectorAll(".product, .pricing").forEach((section) => {
      sectionObserver.observe(section);
    });

    root.querySelectorAll("section").forEach((section, i) => {
      if (i > 0) section.setAttribute("data-scroll-section", "");
    });

    const onScroll = () => {
      const sy = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(height > 0 ? Math.min(100, (sy / height) * 100) : 0);
      setBackTopVisible(sy > 600);
      setNavbarScrolled(sy > 60);

      const atBottom = height > 0 && sy >= height - 40;
      if (atBottom && !wasAtBottomRef.current) {
        wasAtBottomRef.current = true;
        setFooterConfettiBurst((n) => n + 1);
        setFooterConfettiActive(true);
        if (confettiTimerRef.current != null) {
          window.clearTimeout(confettiTimerRef.current);
        }
        confettiTimerRef.current = window.setTimeout(() => {
          setFooterConfettiActive(false);
          confettiTimerRef.current = null;
        }, FOOTER_CONFETTI_MS);
      } else if (!atBottom && sy < height - 160) {
        wasAtBottomRef.current = false;
      }

      const offset = sy + 120;
      let current = "home";
      root.querySelectorAll("section[id]").forEach((section) => {
        const el = section as HTMLElement;
        if (el.offsetTop <= offset && el.offsetTop + el.offsetHeight > offset) {
          current = el.id;
        }
      });
      setActiveSection(current);

      heroParallax(sy);
      pricingParallax();

      root.querySelectorAll("[data-scroll-section]").forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
        const shift = Math.max(-24, Math.min(24, rect.top * 0.05));
        (section as HTMLElement).style.transform = `translateY(${shift}px)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      heroVisual?.removeEventListener("mousemove", onHeroMove);
      heroVisual?.removeEventListener("mouseleave", onHeroLeave);
      observer.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (confettiTimerRef.current != null) {
        window.clearTimeout(confettiTimerRef.current);
      }
    };
  }, [loaderGone]);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSent(true);
    e.currentTarget.reset();
    window.setTimeout(() => setFormSent(false), 3000);
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      window.setTimeout(() => scrollToSection(hash), 100);
    }
  }, [loaderGone]);

  return {
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
  };
}
