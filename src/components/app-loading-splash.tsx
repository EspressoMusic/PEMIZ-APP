"use client";

import { useEffect, useState } from "react";
import { APP_LOADING_LOGO_SRC, APP_SPLASH_BG } from "@/lib/app-branding";

const TAGLINE_BRAND = "Peymiz";
const TAGLINE_REST = " orders made simple";
const TAGLINE_BRAND_HE = "פיימיז";
const TAGLINE_REST_HE = " הזמנות נעשות בקלות";
const TAGLINE_CHAR_DELAY = 0.035;
const TAGLINE_START_DELAY = 0.35;
const NBSP = " ";

function AnimatedTaglineChars({ text, startIndex }: { text: string; startIndex: number }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <span
          key={startIndex + i}
          className="app-loading-splash-tagline-char"
          style={{ animationDelay: `${TAGLINE_START_DELAY + (startIndex + i) * TAGLINE_CHAR_DELAY}s` }}
        >
          {char === " " ? NBSP : char}
        </span>
      ))}
    </>
  );
}

export function AppLoadingSplash({
  locale = "en",
}: {
  locale?: "en" | "he";
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    if (document.readyState === "complete") {
      window.requestAnimationFrame(hide);
      return;
    }
    window.addEventListener("load", hide, { once: true });
    return () => window.removeEventListener("load", hide);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="app-loading-splash fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 transition-opacity duration-300 ease-out"
      style={{ backgroundColor: APP_SPLASH_BG }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={APP_LOADING_LOGO_SRC}
        alt=""
        width={512}
        height={512}
        className="app-loading-splash-logo h-[min(72vw,18rem)] w-[min(72vw,18rem)] object-contain sm:h-72 sm:w-72"
      />
      {locale === "he" ? (
        <p
          className="app-loading-splash-tagline app-loading-splash-tagline-he"
          dir="rtl"
          lang="he"
        >
          <span className="app-loading-splash-tagline-brand">
            <AnimatedTaglineChars text={TAGLINE_BRAND_HE} startIndex={0} />
          </span>
          <AnimatedTaglineChars text={TAGLINE_REST_HE} startIndex={TAGLINE_BRAND_HE.length} />
        </p>
      ) : (
        <p className="app-loading-splash-tagline" dir="ltr" lang="en">
          <span className="app-loading-splash-tagline-brand">
            <AnimatedTaglineChars text={TAGLINE_BRAND} startIndex={0} />
          </span>
          <AnimatedTaglineChars text={TAGLINE_REST} startIndex={TAGLINE_BRAND.length} />
        </p>
      )}
    </div>
  );
}
