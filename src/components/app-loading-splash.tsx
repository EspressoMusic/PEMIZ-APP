"use client";

import { useEffect, useState } from "react";
import { APP_LOADING_LOGO_SRC, APP_SPLASH_BG } from "@/lib/app-branding";

export function AppLoadingSplash() {
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
      <p className="app-loading-splash-tagline">
        <span className="app-loading-splash-tagline-brand">Peymiz</span> orders made simple
      </p>
    </div>
  );
}
