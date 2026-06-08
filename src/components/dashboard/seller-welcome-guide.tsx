"use client";

import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ClipboardList, Package, Users, Calendar, Sparkles } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

const STORAGE_PREFIX = "linky_seller_guide_done:";

function storageKey(businessId: string) {
  return `${STORAGE_PREFIX}${businessId}`;
}

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
  const isAppointments = businessType === "APPOINTMENTS";

  const tips = isAppointments
    ? [
        {
          icon: Sparkles,
          title: labels.sellerGuideWelcomeTipAddServiceTitle,
          body: labels.sellerGuideWelcomeTipAddServiceBody,
        },
        {
          icon: Calendar,
          title: labels.sellerGuideWelcomeTipCalendarTitle,
          body: labels.sellerGuideWelcomeTipCalendarBody,
        },
        {
          icon: Users,
          title: labels.sellerGuideWelcomeTipCustomersTitle,
          body: labels.sellerGuideWelcomeTipCustomersBody,
        },
      ]
    : [
        {
          icon: Package,
          title: labels.sellerGuideWelcomeTipAddProductTitle,
          body: labels.sellerGuideWelcomeTipAddProductBody,
        },
        {
          icon: ClipboardList,
          title: labels.sellerGuideWelcomeTipOrdersTitle,
          body: labels.sellerGuideWelcomeTipOrdersBody,
        },
        {
          icon: Users,
          title: labels.sellerGuideWelcomeTipCustomersTitle,
          body: labels.sellerGuideWelcomeTipCustomersBody,
        },
      ];

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/45"
        onClick={onSkip}
        aria-label={labels.close}
      />
      <div className="relative z-10 mx-auto w-full max-w-md shrink-0 rounded-[24px] border border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-mid p-5 shadow-[var(--shadow-bakery-panel)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] shadow-[0_4px_14px_rgba(58,47,38,0.15)]">
          <Image
            src="/icons/linky-app-logo.png"
            alt="Linky"
            width={80}
            height={80}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <h2 className="mt-4 text-center text-[20px] font-extrabold text-bakery-ink">
          {labels.sellerGuideTitle}
        </h2>
        <p className="mt-2 text-center text-[14px] leading-[1.55] text-bakery-muted">
          {isAppointments
            ? labels.sellerGuideIntroAppointments
            : labels.sellerGuideIntro}
        </p>

        <ul className="mt-4 space-y-3 text-start">
          {tips.map((tip) => {
            const Icon = tip.icon;
            return (
              <li
                key={tip.title}
                className="flex gap-3 rounded-[18px] border border-bakery-border/30 bg-bakery-card/60 px-3 py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-bakery-cream-mid text-bakery-primary">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-extrabold text-bakery-ink">
                    {tip.title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-[1.45] text-bakery-muted">
                    {tip.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-col gap-2">
          <Button type="button" className="w-full" onClick={onClose}>
            {labels.sellerGuideFinish}
          </Button>
          <button
            type="button"
            onClick={onSkip}
            className="min-h-[40px] text-[14px] font-bold text-bakery-muted"
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
  children,
}: {
  businessId: string;
  businessType: string;
  basePath?: string;
  forceStart?: boolean;
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

    const done = localStorage.getItem(storageKey(businessId)) === "1";
    if (welcome || !done) {
      setOpen(true);
    }
  }, [businessId, welcome, forceStart, searchParams, pathname, router]);

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
  children,
}: {
  businessId: string;
  businessType: string;
  basePath?: string;
  forceStart?: boolean;
  children?: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <SellerWelcomeGuideInner
        businessId={businessId}
        businessType={businessType}
        basePath={basePath}
        forceStart={forceStart}
      >
        {children}
      </SellerWelcomeGuideInner>
    </Suspense>
  );
}
