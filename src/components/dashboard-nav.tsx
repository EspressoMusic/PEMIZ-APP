"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Zap } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DASHBOARD_MOBILE_STACK } from "@/components/dashboard/dashboard-panel-frame";

export function DashboardNav({
  businessType: _businessType,
  basePath = "/dashboard",
  homeHref: homeHrefOverride,
  actionsHref: actionsHrefOverride,
  activeTab,
}: {
  businessType?: string;
  /** למשל /dev/seller בתצוגה מקומית */
  basePath?: string;
  /** דריסה לדף מדריך — שני הכפתורים נשארים באותו URL */
  homeHref?: string;
  actionsHref?: string;
  /** כשהבית והפעולות באותו נתיב (מדריך dev) */
  activeTab?: "home" | "actions";
}) {
  const pathname = usePathname();
  const { labels } = useAppLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const homeHref = homeHrefOverride ?? basePath;
  const actionsHref = actionsHrefOverride ?? `${basePath}/actions`;
  const defaultLinks = [
    { key: "home" as const, segment: "", label: labels.navHome, icon: Home },
    {
      key: "actions" as const,
      segment: "/actions",
      label: labels.navActions,
      icon: Zap,
    },
  ];

  const isHome = mounted
    ? activeTab
      ? activeTab === "home"
      : pathname === homeHref ||
        pathname === `${homeHref}/` ||
        (!homeHrefOverride &&
          (pathname === basePath || pathname === `${basePath}/`))
    : false;
  const isActions = mounted
    ? activeTab
      ? activeTab === "actions"
      : pathname === actionsHref ||
        (!actionsHrefOverride &&
          pathname.startsWith(`${basePath}/`) &&
          pathname !== basePath &&
          pathname !== `${basePath}/`)
    : false;

  const links = defaultLinks.map((l) => ({
    ...l,
    href: l.key === "home" ? homeHref : actionsHref,
  }));

  return (
    <nav
      className="dashboard-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-bakery-card"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label={labels.navSeller}
    >
      <div className={`flex w-full pt-2 ${DASHBOARD_MOBILE_STACK} px-4`}>
        {links.map((l) => {
          const active = l.key === "home" ? isHome : isActions;
          const Icon = l.icon;
          return (
            <Link
              key={l.key}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center rounded-full px-2 py-2 transition ${
                active
                  ? "dashboard-bottom-nav__link--active text-bakery-ink"
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
                {l.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
