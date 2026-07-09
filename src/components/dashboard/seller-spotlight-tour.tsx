"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { isScheduleLikeBusinessType } from "@/lib/types";
import type { DashboardLabels } from "@/lib/dashboard-messages";

const STORAGE_PREFIX = "linky_seller_spotlight_tour_done:";

function storageKey(businessId: string) {
  return `${STORAGE_PREFIX}${businessId}`;
}

type TourStep = {
  id: string;
  route: string;
  targetSelector: string | null;
  title: string;
  body: string;
};

function buildTourSteps(
  basePath: string,
  isAppointments: boolean,
  labels: DashboardLabels
): TourStep[] {
  const shareStep: TourStep = {
    id: "share-link",
    route: basePath,
    targetSelector: '[data-tour-id="tour-share-link"]',
    title: labels.sellerGuideWelcomeStepLinkTitle,
    body: labels.sellerGuideWelcomeStepLinkBody,
  };

  if (isAppointments) {
    return [
      {
        id: "add-service",
        route: `${basePath}/products`,
        targetSelector: '[data-tour-id="tour-add-product"]',
        title: labels.sellerGuideWelcomeTipAddServiceTitle,
        body: labels.sellerGuideWelcomeTipAddServiceBody,
      },
      {
        id: "appointments",
        route: `${basePath}/appointments`,
        targetSelector: '[data-tour-id="tour-appointments"]',
        title: labels.sellerGuideWelcomeTipBookedAppointmentsTitle,
        body: labels.sellerGuideWelcomeTipBookedAppointmentsBody,
      },
      shareStep,
    ];
  }

  return [
    {
      id: "add-product",
      route: `${basePath}/products`,
      targetSelector: '[data-tour-id="tour-add-product"]',
      title: labels.sellerGuideWelcomeTipAddProductTitle,
      body: labels.sellerGuideWelcomeTipAddProductBody,
    },
    {
      id: "deals",
      route: `${basePath}/settings/deals-and-limits`,
      targetSelector: '[data-tour-id="tour-add-deal"]',
      title: labels.sellerGuideWelcomeTipDealsTitle,
      body: labels.sellerGuideWelcomeTipDealsBody,
    },
    {
      id: "orders",
      route: `${basePath}/settings/orders`,
      targetSelector: '[data-tour-id="tour-orders"]',
      title: labels.sellerGuideWelcomeTipOrdersTitle,
      body: labels.sellerGuideWelcomeTipOrdersBody,
    },
    shareStep,
  ];
}

type TourContextValue = {
  start: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function useSellerSpotlightTour(): TourContextValue {
  const ctx = useContext(TourContext);
  return ctx ?? { start: () => {} };
}

const RECT_POLL_MS = 150;
const RECT_POLL_TIMEOUT_MS = 3000;

function useTargetRect(selector: string | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setRect(null);
    if (!selector) return;
    const targetSelector = selector;

    let cancelled = false;
    let elapsed = 0;
    let interval: ReturnType<typeof setInterval> | null = null;

    function measure(): boolean {
      const el = document.querySelector(targetSelector);
      if (el) {
        setRect(el.getBoundingClientRect());
        return true;
      }
      return false;
    }

    if (!measure()) {
      interval = setInterval(() => {
        if (cancelled) return;
        elapsed += RECT_POLL_MS;
        if (measure() || elapsed >= RECT_POLL_TIMEOUT_MS) {
          if (interval) clearInterval(interval);
        }
      }, RECT_POLL_MS);
    }

    const onViewportChange = () => measure();
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [selector]);

  return rect;
}

function SpotlightOverlay({
  step,
  stepIndex,
  totalSteps,
  isLast,
  onNext,
  onSkip,
  labels,
}: {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  isLast: boolean;
  onNext: () => void;
  onSkip: () => void;
  labels: DashboardLabels;
}) {
  const [mounted, setMounted] = useState(false);
  const rect = useTargetRect(step.targetSelector);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const pad = 8;
  const isTooLargeToRing =
    rect != null &&
    rect.width * rect.height > 0.6 * window.innerWidth * window.innerHeight;
  const spotlightBox =
    rect && !isTooLargeToRing
      ? {
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }
      : null;

  const tooltipBelowTop = spotlightBox
    ? spotlightBox.top + spotlightBox.height + 12
    : null;
  const fitsBelow =
    tooltipBelowTop != null && tooltipBelowTop < window.innerHeight - 200;

  const tooltipStyle: CSSProperties = spotlightBox
    ? fitsBelow
      ? {
          top: tooltipBelowTop!,
          left: Math.min(
            Math.max(16, spotlightBox.left),
            window.innerWidth - 336
          ),
        }
      : {
          top: Math.max(16, spotlightBox.top - 12),
          left: Math.min(
            Math.max(16, spotlightBox.left),
            window.innerWidth - 336
          ),
          transform: "translateY(-100%)",
        }
    : {};

  return createPortal(
    <div className="fixed inset-0 z-[150]" role="dialog" aria-modal="true">
      {spotlightBox ? (
        <div
          className="absolute rounded-[16px] ring-2 ring-bakery-primary transition-all duration-200"
          style={{
            top: spotlightBox.top,
            left: spotlightBox.left,
            width: spotlightBox.width,
            height: spotlightBox.height,
            boxShadow: "0 0 0 9999px rgba(20,16,14,0.6)",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(20,16,14,0.6)]" />
      )}

      <div
        className={`absolute mx-4 w-[300px] max-w-[calc(100vw-32px)] rounded-[20px] border border-bakery-border/40 bg-bakery-cream-light p-4 shadow-[var(--shadow-bakery-panel)] ${
          spotlightBox
            ? ""
            : "start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        }`}
        style={tooltipStyle}
      >
        <p className="text-[12px] font-bold text-bakery-muted">
          {stepIndex + 1} / {totalSteps}
        </p>
        <h3 className="mt-1 text-[16px] font-extrabold text-bakery-ink">
          {step.title}
        </h3>
        <p className="mt-1.5 text-[14px] font-semibold leading-[1.5] text-bakery-muted">
          {step.body}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-[13px] font-bold text-bakery-muted transition hover:text-bakery-ink"
          >
            {labels.sellerGuideSkip}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="bakery-cta-3d bakery-cta-3d--primary min-h-[38px] rounded-full px-4 text-[14px] font-extrabold !shadow-none"
          >
            {isLast ? labels.sellerGuideFinish : labels.sellerGuideNext}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function SellerSpotlightTourProvider({
  businessId,
  businessType,
  basePath = "/dashboard",
  children,
}: {
  businessId: string;
  businessType: string;
  basePath?: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { labels } = useAppLocale();
  const isAppointments = isScheduleLikeBusinessType(businessType);
  const [stepIndex, setStepIndex] = useState<number | null>(null);

  const steps = useMemo(
    () => buildTourSteps(basePath, isAppointments, labels),
    [basePath, isAppointments, labels]
  );

  const start = useCallback(() => {
    setStepIndex(0);
  }, []);

  const next = useCallback(() => {
    setStepIndex((current) => {
      if (current == null) return current;
      const nextIndex = current + 1;
      if (nextIndex >= steps.length) {
        localStorage.setItem(storageKey(businessId), "1");
        return null;
      }
      return nextIndex;
    });
  }, [steps.length, businessId]);

  const skip = useCallback(() => {
    localStorage.setItem(storageKey(businessId), "1");
    setStepIndex(null);
  }, [businessId]);

  useEffect(() => {
    if (stepIndex == null) return;
    const step = steps[stepIndex];
    if (step && pathname !== step.route) {
      router.push(step.route);
    }
  }, [stepIndex, steps, pathname, router]);

  const contextValue = useMemo(() => ({ start }), [start]);
  const activeStep = stepIndex != null ? steps[stepIndex] : null;

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      {activeStep ? (
        <SpotlightOverlay
          step={activeStep}
          stepIndex={stepIndex!}
          totalSteps={steps.length}
          isLast={stepIndex === steps.length - 1}
          onNext={next}
          onSkip={skip}
          labels={labels}
        />
      ) : null}
    </TourContext.Provider>
  );
}
