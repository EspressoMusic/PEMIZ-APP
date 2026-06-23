"use client";

import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { isScheduleLikeBusinessType } from "@/lib/types";

const STORAGE_PREFIX = "linky_seller_guide_done:";

function storageKey(businessId: string) {
  return `${STORAGE_PREFIX}${businessId}`;
}

function formatStepCounter(
  template: string,
  current: number,
  total: number
) {
  return template
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

const GUIDE_PRIMARY_BTN =
  "bakery-cta-3d bakery-cta-3d--primary !max-w-none min-h-[44px] !rounded-full !shadow-none font-extrabold hover:!opacity-100";

function WelcomeGuideModal({
  businessType,
  onClose,
  onSkip,
}: {
  businessType: string;
  onClose: () => void;
  onSkip: () => void;
}) {
  const { labels } = useAppLocale();
  const isAppointments = isScheduleLikeBusinessType(businessType);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tips = [
    {
      title: labels.sellerGuideWelcomeTipCustomersTitle,
      body: labels.sellerGuideWelcomeTipCustomersBody,
    },
    {
      title: labels.sellerGuideWelcomeStepStoreTitle,
      body: isAppointments
        ? labels.sellerGuideWelcomeStepStoreBodyAppointments
        : labels.sellerGuideWelcomeStepStoreBody,
    },
    {
      title: labels.sellerGuideWelcomeStepLinkTitle,
      body: labels.sellerGuideWelcomeStepLinkBody,
    },
  ];

  const totalSlides = tips.length;
  const isLast = step === totalSlides - 1;
  const currentTip = tips[step] ?? null;

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-welcome-guide-title"
    >
      <div
        className="absolute inset-0 bg-bakery-ink/45"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-md shrink-0 rounded-[24px] border border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-mid p-5 shadow-[var(--shadow-bakery-panel)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] shadow-[0_4px_14px_rgba(58,47,38,0.15)]">
          <Image
            src="/icons/linky-app-logo.png"
            alt="Linky"
            width={80}
            height={80}
            className="h-full w-full object-contain"
            priority
          />
        </div>

        {currentTip ? (
          <div className="mt-4 text-center">
            {step === 0 ? (
              <>
                <p className="text-[20px] font-extrabold text-bakery-ink">
                  {labels.sellerGuideTitle}
                </p>
                <p className="mt-2 text-[15px] font-bold text-bakery-primary">
                  {isAppointments
                    ? labels.sellerGuideIntroAppointments
                    : labels.sellerGuideIntro}
                </p>
              </>
            ) : null}
            <p className={`text-[13px] font-bold text-bakery-muted ${step === 0 ? "mt-3" : "mt-0"}`}>
              {formatStepCounter(
                labels.sellerGuideStepCounter,
                step + 1,
                totalSlides
              )}
            </p>
            <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-bakery-primary text-[26px] font-extrabold leading-none text-bakery-on-primary shadow-[var(--shadow-bakery-btn)]">
              {step + 1}
            </div>
            <h2
              id="seller-welcome-guide-title"
              className="mt-4 text-[19px] font-extrabold leading-snug text-bakery-ink"
            >
              {currentTip.title}
            </h2>
            <p className="mt-3 text-[16px] font-semibold leading-[1.5] text-bakery-muted">
              {currentTip.body}
            </p>
          </div>
        ) : null}

        <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
          {Array.from({ length: totalSlides }, (_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? "w-6 bg-bakery-primary"
                  : "w-2 bg-bakery-border/50"
              }`}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <div className="flex gap-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                className="min-h-[44px] flex-1 font-extrabold"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                {labels.sellerGuideBack}
              </Button>
            ) : null}
            {isLast ? (
              <Button
                type="button"
                className={`${GUIDE_PRIMARY_BTN} ${step > 0 ? "flex-[2]" : "w-full"}`}
                onClick={onClose}
              >
                {labels.sellerGuideFinish}
              </Button>
            ) : (
              <Button
                type="button"
                className={`${GUIDE_PRIMARY_BTN} ${step > 0 ? "flex-[2]" : "w-full"}`}
                onClick={() => setStep((s) => s + 1)}
              >
                {labels.sellerGuideNext}
              </Button>
            )}
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="min-h-[40px] text-[14px] font-bold text-bakery-muted transition hover:text-bakery-ink"
          >
            {labels.sellerGuideSkip}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function SellerWelcomeGuideInner({
  businessId,
  businessType,
  basePath = "/dashboard",
  forceStart = false,
  appointmentScheduleConfigured = true,
  children,
}: {
  businessId: string;
  businessType: string;
  basePath?: string;
  forceStart?: boolean;
  appointmentScheduleConfigured?: boolean;
  children?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const [open, setOpen] = useState(false);

  const dismiss = useCallback(() => {
    localStorage.setItem(storageKey(businessId), "1");
    setOpen(false);
    if (welcome && !forceStart) {
      router.replace(basePath);
    }
  }, [businessId, welcome, forceStart, router, basePath]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const shouldReset = searchParams.get("reset") === "1";
    if (shouldReset) {
      localStorage.removeItem(storageKey(businessId));
      setOpen(true);
      router.replace(pathname);
      return;
    }

    if (forceStart) {
      setOpen(true);
      return;
    }

    if (
      isScheduleLikeBusinessType(businessType) &&
      !appointmentScheduleConfigured
    ) {
      return;
    }

    const done = localStorage.getItem(storageKey(businessId)) === "1";
    if (welcome || !done) {
      setOpen(true);
    }
  }, [
    businessId,
    businessType,
    welcome,
    forceStart,
    appointmentScheduleConfigured,
    searchParams,
    pathname,
    router,
  ]);

  return (
    <>
      {children}
      {open ? (
        <WelcomeGuideModal
          businessType={businessType}
          onClose={dismiss}
          onSkip={dismiss}
        />
      ) : null}
    </>
  );
}

export function SellerWelcomeGuide({
  businessId,
  businessType,
  basePath = "/dashboard",
  forceStart = false,
  appointmentScheduleConfigured = true,
  children,
}: {
  businessId: string;
  businessType: string;
  basePath?: string;
  forceStart?: boolean;
  appointmentScheduleConfigured?: boolean;
  children?: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <SellerWelcomeGuideInner
        businessId={businessId}
        businessType={businessType}
        basePath={basePath}
        forceStart={forceStart}
        appointmentScheduleConfigured={appointmentScheduleConfigured}
      >
        {children}
      </SellerWelcomeGuideInner>
    </Suspense>
  );
}
