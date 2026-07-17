"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarClock,
  Check,
  ClipboardList,
  Clock,
  Gift,
  HelpCircle,
  Inbox,
  Megaphone,
  Package,
  Sparkles,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { requestDashboardHubTab } from "@/components/dashboard/dashboard-hub-context";
import { isScheduleLikeBusinessType } from "@/lib/types";
import type { DashboardLabels } from "@/lib/dashboard-messages";

const STORAGE_PREFIX = "linky_seller_guide_done:";

function storageKey(businessId: string) {
  return `${STORAGE_PREFIX}${businessId}`;
}

/** The id of the guide step currently on screen, so a spotlighted element
 * buried inside a closed panel (e.g. a settings sheet) can open itself. */
const SellerGuideActiveStepContext = createContext<string | null>(null);

export function useSellerGuideActiveStep() {
  return useContext(SellerGuideActiveStepContext);
}

/** Maps a step's route to the hub's CSS-only tab, if it is one — lets the
 * routing effect ask the hub to switch instantly instead of falling back to a
 * real Next.js navigation between /dashboard and /dashboard/actions. */
function hubTabForRoute(route: string, basePath: string): "home" | "actions" | null {
  if (route === basePath) return "home";
  if (route === `${basePath}/actions`) return "actions";
  return null;
}

type GuideListItem = {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
};

type GuideStep = {
  id: string;
  /** 1-based step shown to the user — several steps can share a number (e.g. the home screen covers two highlights). */
  displayStep: number;
  /** The opening screen: no spotlight, no step counter — just an invitation to start. */
  isIntro?: boolean;
  route: string;
  targetSelector: string | null;
  /** Shown above the title on steps that explain a concept rather than spotlight an element. */
  icon?: LucideIcon;
  title: string;
  body: string;
  /** Renders as a mini checklist (icon + label per row, checkmarks revealed one after another) instead of a plain body paragraph. */
  listItems?: GuideListItem[];
  /** Selector of a neighboring element the ring must never bleed into — e.g. the
   * home screen's order/calendar card sits in a flex row that stretches to fill
   * remaining height, landing just a few px above the share-link card below it. */
  avoidSelector?: string;
};

function buildSteps(
  basePath: string,
  isAppointments: boolean,
  labels: DashboardLabels
): GuideStep[] {
  const homeStep: GuideStep = isAppointments
    ? {
        id: "home-calendar",
        displayStep: 1,
        route: basePath,
        targetSelector: '[data-tour-id="tour-home-calendar"]',
        title: labels.sellerGuideWelcomeTipCalendarTitle,
        body: labels.sellerGuideWelcomeTipCalendarBody,
        avoidSelector: '[data-tour-id="tour-share-link"]',
      }
    : {
        id: "home-orders",
        displayStep: 1,
        route: basePath,
        targetSelector: '[data-tour-id="tour-home-orders"]',
        title: labels.sellerGuideWelcomeTipOrdersTitle,
        body: labels.sellerGuideWelcomeHomeOrdersBody,
        avoidSelector: '[data-tour-id="tour-share-link"]',
      };

  return [
    {
      id: "intro",
      displayStep: 1,
      isIntro: true,
      route: basePath,
      targetSelector: null,
      icon: Sparkles,
      title: labels.sellerGuideIntroTitle,
      body: labels.sellerGuideIntroBody,
    },
    homeStep,
    {
      id: "home-notifications",
      displayStep: 1,
      route: basePath,
      targetSelector: '[data-tour-id="tour-home-notifications"]',
      title: labels.sellerGuideWelcomeHomeNotificationsTitle,
      body: labels.sellerGuideWelcomeHomeNotificationsBody,
    },
    {
      id: "share-link",
      displayStep: 2,
      route: basePath,
      targetSelector: '[data-tour-id="tour-share-link"]',
      title: labels.sellerGuideWelcomeStepLinkTitle,
      body: labels.sellerGuideWelcomeStepLinkBody,
    },
    {
      id: "store-panel",
      displayStep: 3,
      route: `${basePath}/actions`,
      targetSelector: '[data-tour-id="tour-store-square"]',
      title: labels.sellerGuideWelcomeStepStorePanelTitle,
      body: labels.sellerGuideWelcomeStepStorePanelBody,
      listItems: isAppointments
        ? [
            { icon: ClipboardList, label: labels.appointments },
            { icon: Package, label: labels.services },
            { icon: CalendarClock, label: labels.appointmentCalendar },
          ]
        : [
            {
              icon: ClipboardList,
              label: labels.orders,
              sublabel: labels.sellerGuideChecklistOrdersSublabel,
            },
            {
              icon: Package,
              label: labels.products,
              sublabel: labels.sellerGuideChecklistProductsSublabel,
            },
            {
              icon: Gift,
              label: labels.sellerGuideChecklistDealsTitle,
              sublabel: labels.sellerGuideChecklistDealsSublabel,
            },
            {
              icon: Ticket,
              label: labels.sellerGuideChecklistCouponsTitle,
              sublabel: labels.sellerGuideChecklistCouponsSublabel,
            },
            {
              icon: Clock,
              label: labels.sellerGuideChecklistOrderHoursTitle,
              sublabel: labels.sellerGuideChecklistOrderHoursSublabel,
            },
          ],
    },
    {
      id: "customers-panel",
      displayStep: 4,
      route: `${basePath}/actions`,
      targetSelector: '[data-tour-id="tour-customers-square"]',
      title: labels.sellerGuideWelcomeStepCustomersPanelTitle,
      body: labels.sellerGuideWelcomeStepCustomersPanelBody,
      listItems: [
        {
          icon: Megaphone,
          label: labels.customerMessage,
          sublabel: labels.sellerGuideChecklistBroadcastSublabel,
        },
        {
          icon: Inbox,
          label: labels.customerInquiries,
          sublabel: labels.sellerGuideChecklistInquiriesSublabel,
        },
        {
          icon: HelpCircle,
          label: labels.faq,
          sublabel: labels.sellerGuideChecklistFaqSublabel,
        },
      ],
    },
    {
      id: "settings-row",
      displayStep: 5,
      route: `${basePath}/actions`,
      targetSelector: '[data-tour-id="tour-settings-row"]',
      title: labels.sellerGuideWelcomeStepSettingsTitle,
      body: labels.sellerGuideWelcomeStepSettingsBody,
    },
    ...(isAppointments
      ? []
      : [
          {
            id: "order-confirmation",
            displayStep: 6,
            // The toggle lives inside the Style & Language sheet, which is closed
            // by default — DashboardStoreStylePicker opens itself when this step
            // becomes active (see useSellerGuideActiveStep).
            route: `${basePath}/actions`,
            targetSelector: '[data-tour-id="tour-order-confirmation"]',
            title: labels.sellerGuideWelcomeTipOrderConfirmationTitle,
            body: labels.sellerGuideWelcomeTipOrderConfirmationBody,
          },
        ]),
  ];
}

/** Renders `**word**` segments in guide copy as bold text instead of a literal marker. */
function renderEmphasized(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-extrabold text-bakery-ink">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

const RECT_POLL_MS = 150;
const RECT_POLL_TIMEOUT_MS = 3000;

/** Elements the hub hides via CSS (the sibling home/actions tab) report a zero-size rect — treat that as "not visible yet", not "found". */
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
        const candidate = el.getBoundingClientRect();
        if (candidate.width > 0 && candidate.height > 0) {
          setRect(candidate);
          return true;
        }
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

/** Mini checklist inside the tooltip — each row's check mark pops in a beat after the previous one. */
function GuideChecklist({ items }: { items: GuideListItem[] }) {
  return (
    <div className="mt-3 space-y-2">
      {items.map(({ icon: Icon, label, sublabel }, index) => (
        <div
          key={label}
          className="flex items-center justify-between gap-3 rounded-[14px] border-2 border-black/20 bg-white/40 px-3 py-2"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon
              className="h-5 w-5 shrink-0 text-bakery-primary"
              strokeWidth={1.75}
            />
            <span className="min-w-0 text-start">
              <span className="block truncate text-[14px] font-extrabold text-bakery-ink">
                {label}
              </span>
              {sublabel ? (
                <span className="block truncate text-[11px] font-semibold text-bakery-muted">
                  {sublabel}
                </span>
              ) : null}
            </span>
          </span>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-2 border-bakery-primary/40">
            <Check
              className="guide-checklist-tick h-4 w-4 text-bakery-primary"
              strokeWidth={3}
              style={{ animationDelay: `${200 + index * 300}ms` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function GuideSpotlight({
  step,
  totalDisplaySteps,
  isLast,
  onNext,
  onSkip,
  labels,
}: {
  step: GuideStep;
  totalDisplaySteps: number;
  isLast: boolean;
  onNext: () => void;
  onSkip: () => void;
  labels: DashboardLabels;
}) {
  const [mounted, setMounted] = useState(false);
  const rect = useTargetRect(step.targetSelector);
  const avoidRect = useTargetRect(step.avoidSelector ?? null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipHeight, setTooltipHeight] = useState(220);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!el) return;
    setTooltipHeight(el.getBoundingClientRect().height);
  });

  if (!mounted) return null;

  const pad = 8;
  const avoidBuffer = 6;
  const isTooLargeToRing =
    rect != null &&
    rect.width * rect.height > 0.6 * window.innerWidth * window.innerHeight;
  const spotlightBox = (() => {
    if (!rect || isTooLargeToRing) return null;
    const top = rect.top - pad;
    // The home screen's order/calendar card sits in a flex row that stretches to
    // fill remaining height, so its own bottom edge can land just a few px above
    // the share-link card below — clamp the ring so it never reveals that too.
    const rawBottom = rect.bottom + pad;
    const bottom =
      avoidRect && avoidRect.top > rect.top
        ? Math.min(rawBottom, avoidRect.top - avoidBuffer)
        : rawBottom;
    return {
      top,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: Math.max(rect.height, bottom - top),
    };
  })();

  const fitsBelow =
    spotlightBox != null &&
    spotlightBox.top + spotlightBox.height + 12 + tooltipHeight + 16 <=
      window.innerHeight;

  const tooltipStyle: CSSProperties = spotlightBox
    ? {
        top: fitsBelow
          ? spotlightBox.top + spotlightBox.height + 12
          : Math.max(16, spotlightBox.top - 12 - tooltipHeight),
        left: Math.min(
          Math.max(16, spotlightBox.left),
          window.innerWidth - 336
        ),
      }
    : {};

  const counter = labels.sellerGuideStepCounter
    .replace("{current}", String(step.displayStep))
    .replace("{total}", String(totalDisplaySteps));

  return createPortal(
    <div
      className={`fixed inset-0 z-[150] ${
        spotlightBox ? "" : "flex items-center justify-center"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-welcome-guide-title"
    >
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
        ref={tooltipRef}
        className={`mx-4 w-[300px] max-w-[calc(100vw-32px)] rounded-[20px] border border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-mid p-4 shadow-[var(--shadow-bakery-panel)] ${
          spotlightBox ? "absolute" : "relative"
        }`}
        style={tooltipStyle}
      >
        {step.isIntro ? null : (
          <p className="text-center text-[13px] font-bold text-bakery-muted">
            {counter}
          </p>
        )}
        {step.icon ? (
          <span className="mx-auto mt-1 flex h-12 w-12 items-center justify-center rounded-full border-2 border-bakery-primary/40 bg-white/50">
            <step.icon className="h-6 w-6 text-bakery-primary" strokeWidth={2} />
          </span>
        ) : null}
        <h2
          id="seller-welcome-guide-title"
          className="mt-1 text-center text-[19px] font-extrabold text-bakery-ink"
        >
          {step.title}
        </h2>
        <p className="mt-1.5 text-center text-[16px] font-semibold leading-[1.5] text-bakery-muted">
          {renderEmphasized(step.body)}
        </p>
        {step.listItems ? <GuideChecklist items={step.listItems} /> : null}
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
            className="bakery-cta-3d bakery-cta-3d--primary !w-auto min-h-[30px] !rounded-[14px] !px-3 !py-1.5 text-[12px] font-extrabold !shadow-none"
          >
            {step.isIntro
              ? labels.sellerGuideIntroStart
              : isLast
                ? labels.sellerGuideFinish
                : labels.sellerGuideNext}
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
  const { labels } = useAppLocale();
  const welcome = searchParams.get("welcome") === "1";
  const resetRequested = searchParams.get("reset") === "1";
  const isAppointments = isScheduleLikeBusinessType(businessType);
  const [stepIndex, setStepIndex] = useState<number | null>(null);

  const steps = useMemo(
    () => buildSteps(basePath, isAppointments, labels),
    [basePath, isAppointments, labels]
  );
  const totalDisplaySteps = steps[steps.length - 1]?.displayStep ?? 1;

  const finish = useCallback(() => {
    localStorage.setItem(storageKey(businessId), "1");
    setStepIndex(null);
    // The hub (real dashboard) switches tabs instantly via pushState and
    // already lands the URL on basePath — only fall back to a real
    // navigation when nothing handled the request (e.g. the /dev/guide
    // preview, which has no DashboardHubShell).
    const handled = requestDashboardHubTab("home");
    if (!handled && (welcome || pathname !== basePath)) {
      router.replace(basePath);
    }
  }, [businessId, welcome, basePath, pathname, router]);

  const next = useCallback(() => {
    setStepIndex((current) => {
      if (current == null) return current;
      const nextIndex = current + 1;
      if (nextIndex >= steps.length) {
        finish();
        return null;
      }
      return nextIndex;
    });
  }, [steps.length, finish]);

  // Decide whether to (re)start the tour. Guarded by `stepIndex != null` so this
  // never fires while the tour's own step-navigation is changing the route/query.
  // `decidedRef` makes the forceStart/welcome/done check run only once per mount —
  // otherwise finishing the tour sets stepIndex back to null, which would
  // re-trigger this effect and immediately reopen it (forceStart never changes,
  // and `welcome` may still read true for one render before router.replace clears it).
  const decidedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (stepIndex != null) return;

    if (resetRequested) {
      localStorage.removeItem(storageKey(businessId));
      setStepIndex(0);
      router.replace(pathname);
      return;
    }

    if (decidedRef.current) return;

    if (isAppointments && !appointmentScheduleConfigured) {
      // Not decided yet — wait for the appointment schedule setup to
      // complete, then make the one-time decision below.
      return;
    }

    decidedRef.current = true;

    if (forceStart) {
      setStepIndex(0);
      return;
    }

    const done = localStorage.getItem(storageKey(businessId)) === "1";
    if (welcome || !done) {
      setStepIndex(0);
    }
  }, [
    businessId,
    isAppointments,
    welcome,
    resetRequested,
    forceStart,
    appointmentScheduleConfigured,
    router,
    pathname,
    stepIndex,
  ]);

  // Reach the step's route without a real Next.js navigation when possible —
  // if it's just the hub's home/actions tab, ask it to switch instantly via
  // the same pushState swap the bottom nav uses (see requestDashboardHubTab).
  // Only fall back to router.push (a real navigation, with its network round
  // trip and flash) if nothing handled that request and the target is still
  // not visible after a beat — e.g. the /dev/guide preview, which renders
  // only one panel at a time and has no DashboardHubShell to intercept it.
  useEffect(() => {
    if (stepIndex == null) return;
    const step = steps[stepIndex];
    if (!step || pathname === step.route) return;

    const hubTab = hubTabForRoute(step.route, basePath);
    const handled = hubTab != null && requestDashboardHubTab(hubTab);

    if (!step.targetSelector) {
      if (!handled) router.push(step.route);
      return;
    }
    const targetSelector = step.targetSelector;
    const targetRoute = step.route;

    let cancelled = false;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      const el = document.querySelector(targetSelector);
      const rect = el?.getBoundingClientRect();
      const alreadyVisible = Boolean(rect && rect.width > 0 && rect.height > 0);
      if (!alreadyVisible) {
        router.push(targetRoute);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [stepIndex, steps, pathname, router, basePath]);

  const activeStep = stepIndex != null ? steps[stepIndex] : null;

  return (
    <>
      <SellerGuideActiveStepContext.Provider value={activeStep?.id ?? null}>
        {children}
      </SellerGuideActiveStepContext.Provider>
      {activeStep ? (
        <GuideSpotlight
          key={activeStep.id}
          step={activeStep}
          totalDisplaySteps={totalDisplaySteps}
          isLast={stepIndex === steps.length - 1}
          onNext={next}
          onSkip={finish}
          labels={labels}
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
