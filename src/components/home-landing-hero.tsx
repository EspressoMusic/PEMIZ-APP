"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HomeBizilinkBrand } from "@/components/home-bizilink-brand";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";
import { Button, Alert, Panel } from "@/components/ui";
import { homeTitleFont } from "@/lib/fonts/home-title-font";

const CONFETTI_MS = 3200;

export function HomeLandingHero({ signupsEnabled }: { signupsEnabled: boolean }) {
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      <section className="app-safe-x flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
        <div className="auth-surface mx-auto w-full max-w-[min(100%,28rem)] sm:max-w-[26rem]">
          <Panel className="dashboard-card sm:p-8">
          <h1
            className={`${homeTitleFont.className} home-landing-title mb-6 text-center text-[28px] leading-[1.15] text-bakery-ink sm:mb-8 sm:text-[34px]`}
          >
            ברוכים הבאים ל:{" "}
            <HomeBizilinkBrand onPointerEnter={stopConfetti} />
          </h1>
          {!signupsEnabled && (
            <div className="mb-5">
              <Alert variant="info">ההרשמה לחנויות חדשות סגורה כרגע.</Alert>
            </div>
          )}
          <div className="flex flex-col items-stretch gap-3 sm:gap-4">
            {signupsEnabled ? (
              <Link href="/signup" className="block w-full">
                <Button className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home !w-full !rounded-full !shadow-none hover:!opacity-100">
                  פתיחת חנות
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home !w-full !rounded-full !opacity-50"
              >
                פתיחת חנות
              </Button>
            )}
            <Link href="/login" className="block w-full">
              <Button
                variant="secondary"
                className="bakery-cta-3d bakery-cta-3d--secondary bakery-cta-3d--home !w-full !rounded-full !border-2 !shadow-none hover:!bg-transparent"
              >
                התחברות
              </Button>
            </Link>
          </div>
          </Panel>
        </div>
      </section>
    </>
  );
}
