"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "סקירה" },
  { href: "/dashboard/products", label: "מוצרים" },
  { href: "/dashboard/orders", label: "הזמנות" },
  { href: "/dashboard/slots", label: "תורים פנויים" },
  { href: "/dashboard/appointments", label: "תורים" },
  { href: "/dashboard/inquiries", label: "פניות" },
  { href: "/dashboard/settings", label: "הגדרות" },
];

export function DashboardNav({ businessType }: { businessType?: string }) {
  const pathname = usePathname();
  const filtered = links.filter((l) => {
    if (businessType === "STORE") {
      return !["/dashboard/slots", "/dashboard/appointments"].includes(l.href);
    }
    if (businessType === "APPOINTMENTS") {
      return l.href !== "/dashboard/products" && l.href !== "/dashboard/orders";
    }
    return l.href === "/dashboard" || l.href === "/dashboard/settings";
  });

  return (
    <aside className="w-full shrink-0 md:w-52">
      <nav className="flex flex-row flex-wrap gap-1 rounded-[22px] border-[1.2px] border-bakery-border/40 bg-gradient-to-b from-[#fbf7ef] to-[#f5efe6] p-2 shadow-[var(--shadow-bakery-card)] md:flex-col">
        {filtered.map((l) => {
          const active =
            pathname === l.href ||
            (l.href !== "/dashboard" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-[14px] px-3 py-2.5 text-[14px] font-bold transition ${
                active
                  ? "bg-bakery-primary text-bakery-on-primary shadow-[0_3px_10px_rgba(58,47,38,0.2)]"
                  : "text-bakery-muted hover:bg-bakery-primary/10 hover:text-bakery-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
