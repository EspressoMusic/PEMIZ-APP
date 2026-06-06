"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardNav({
  businessType: _businessType,
  basePath = "/dashboard",
}: {
  businessType?: string;
  /** למשל /dev/seller בתצוגה מקומית */
  basePath?: string;
}) {
  const pathname = usePathname();
  const { labels } = useAppLocale();
  const homeHref = basePath;
  const defaultLinks = [
    { key: "home" as const, segment: "", label: labels.navHome, icon: Home },
    {
      key: "actions" as const,
      segment: "/actions",
      label: labels.navActions,
      icon: Zap,
    },
  ];
  const actionsHref = `${basePath}/actions`;

  const isHome = pathname === basePath || pathname === `${basePath}/`;
  const isActions =
    pathname === actionsHref ||
    (pathname.startsWith(`${basePath}/`) &&
      pathname !== basePath &&
      pathname !== `${basePath}/`);

  const links = defaultLinks.map((l) => ({
    ...l,
    href: l.segment ? `${basePath}${l.segment}` : basePath,
  }));

  return (
    <nav
      className="dashboard-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-bakery-card"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label={labels.navSeller}
    >
      <div className="mx-auto flex w-full max-w-lg px-6 pt-2">
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
