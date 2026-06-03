"use client";

import { LayoutGrid, Zap } from "lucide-react";

/** Two hub modes — like seller בית | פעולות */
export function CustomerStoreHubNav({
  dashboardLabel,
  actionsLabel,
  hubActive,
  onDashboard,
  onActions,
}: {
  dashboardLabel: string;
  actionsLabel: string;
  hubActive: "dashboard" | "actions";
  onDashboard: () => void;
  onActions: () => void;
}) {
  return (
    <>
      {/* Desktop / tablet: sidebar (matches seller nav card) */}
      <aside className="sticky top-0 z-30 hidden w-52 shrink-0 lg:block">
        <nav className="flex flex-col gap-1 rounded-[22px] border-[1.2px] border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-sheet p-2 shadow-[var(--shadow-bakery-card)]">
          <HubButton
            active={hubActive === "dashboard"}
            label={dashboardLabel}
            icon={LayoutGrid}
            onClick={onDashboard}
          />
          <HubButton
            active={hubActive === "actions"}
            label={actionsLabel}
            icon={Zap}
            onClick={onActions}
          />
        </nav>
      </aside>

      {/* Mobile: bottom bar */}
      <nav
        className="customer-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-bakery-border/25 bg-bakery-card lg:hidden"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
        aria-label={actionsLabel}
      >
        <div className="mx-auto flex max-w-lg px-6 pt-2">
          <HubBarButton
            active={hubActive === "dashboard"}
            label={dashboardLabel}
            icon={LayoutGrid}
            onClick={onDashboard}
          />
          <HubBarButton
            active={hubActive === "actions"}
            label={actionsLabel}
            icon={Zap}
            onClick={onActions}
          />
        </div>
      </nav>
    </>
  );
}

function HubButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof LayoutGrid;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center gap-2 rounded-[14px] px-3 py-2.5 text-[14px] font-bold transition ${
        active
          ? "bg-bakery-primary text-bakery-on-primary shadow-[0_3px_10px_rgba(58,47,38,0.2)]"
          : "text-bakery-muted hover:bg-bakery-primary/10 hover:text-bakery-ink"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.25 : 1.75} />
      <span>{label}</span>
    </button>
  );
}

function HubBarButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof LayoutGrid;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center rounded-[16px] px-2 py-2 transition ${
        active
          ? "customer-bottom-nav__link--active bg-bakery-square text-bakery-ink shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
          : "text-bakery-muted"
      }`}
    >
      <Icon
        className={`h-6 w-6 ${active ? "text-bakery-ink" : "text-bakery-muted"}`}
        strokeWidth={active ? 2.25 : 1.75}
      />
      <span
        className={`mt-1 text-center text-[11px] font-bold leading-tight ${
          active ? "text-bakery-ink" : "text-bakery-muted"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
