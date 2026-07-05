"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppLogo } from "@/components/app-logo";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";
import { Button, Alert, Panel } from "@/components/ui";
import { homeTitleFont } from "@/lib/fonts/home-title-font";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";

const CONFETTI_MS = 3200;

export function HomeLandingHero() {
  const { copy } = useMarketingLocale();
  const [signupsEnabled, setSignupsEnabled] = useState(true);
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/signup-status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { signupsEnabled?: boolean } | null) => {
        if (!cancelled && data && typeof data.signupsEnabled === "boolean") {
          setSignupsEnabled(data.signupsEnabled);
        }
      })
      .catch(() => {
        /* keep default true when DB unavailable */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stopConfetti = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setConfettiActive(false);
  }, []);

  const startConfetti = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setConfettiBurst((n) => n + 1);
    setConfettiActive(true);
    timeoutRef.current = setTimeout(() => {
      setConfettiActive(false);
      timeoutRef.current = null;
    }, CONFETTI_MS);
  }, []);

  useEffect(() => {
    startConfetti();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [startConfetti]);

  return (
    <>
      <DashboardConfettiBackground key={confettiBurst} active={confettiActive} />
      <section className="app-safe-x flex flex-1 flex-col items-center justify-center px-4 py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-16">
        <div className="auth-surface mx-auto flex w-full max-w-[min(100%,28rem)] flex-col items-center sm:max-w-[26rem]">
          <div
            className="mb-5 h-32 w-32 overflow-hidden rounded-[22%] sm:mb-7 sm:h-40 sm:w-40"
            onMouseEnter={stopConfetti}
            onFocus={stopConfetti}
          >
            <AppLogo
              size={176}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <Panel className="dashboard-card w-full sm:p-8">
            <h1
              className={`${homeTitleFont.className} home-landing-title mb-2 text-center text-[28px] leading-[1.15] text-bakery-ink sm:mb-3 sm:text-[34px]`}
            >
              {copy.storeTitle}
            </h1>
            <p className="mb-6 text-center text-[15px] font-semibold leading-snug text-bakery-muted sm:mb-8">
              {copy.storeSub}
            </p>
            {!signupsEnabled && (
              <div className="mb-5">
                <Alert variant="info">{copy.signupsClosed}</Alert>
              </div>
            )}
            <div className="flex flex-col items-stretch gap-3 sm:gap-4">
              {signupsEnabled ? (
                <Link href="/login" prefetch={false} className="block w-full">
                  <Button className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home !w-full !rounded-full !shadow-none hover:!opacity-100">
                    {copy.openStore}
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled
                  className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home !w-full !rounded-full !opacity-50"
                >
                  {copy.openStore}
                </Button>
              )}
              <Link href="/login" prefetch={false} className="block w-full">
                <Button
                  variant="secondary"
                  className="bakery-cta-3d bakery-cta-3d--secondary bakery-cta-3d--home !w-full !rounded-full !border-2 !shadow-none hover:!bg-transparent"
                >
                  {copy.signIn}
                </Button>
              </Link>
            </div>
          </Panel>
        </div>
      </section>
    </>
  );
}
