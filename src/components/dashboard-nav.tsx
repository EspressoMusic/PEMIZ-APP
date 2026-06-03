"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap } from "lucide-react";

const defaultLinks = [
  { key: "home", segment: "", label: "בית", icon: Home },
  { key: "actions", segment: "/actions", label: "פעולות", icon: Zap },
] as const;

export function DashboardNav({
  businessType: _businessType,
  basePath = "/dashboard",
}: {
  businessType?: string;
  /** למשל /dev/seller בתצוגה מקומית */
  basePath?: string;
}) {
  const pathname = usePathname();
  const homeHref = basePath;
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-bakery-border/20 bg-[#f5e9e2]"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label="ניווט מוכר"
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
              className={`flex flex-1 flex-col items-center rounded-[16px] px-2 py-2 transition ${
                active
                  ? "bg-[#dfc4b0] shadow-[0_2px_8px_rgba(58,47,38,0.12)]"
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
