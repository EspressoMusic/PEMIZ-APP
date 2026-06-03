"use client";

import { useState } from "react";
import { Leaf, Sun, Moon, ChevronLeft, Palette } from "lucide-react";
import type { CustomerDisplayTheme } from "@/lib/customer-preferences";

const STYLES: {
  id: CustomerDisplayTheme;
  label: string;
  icon: typeof Leaf;
  preview: string;
}[] = [
  { id: "calm", label: "רגוע", icon: Leaf, preview: "from-[#f5efe6] to-[#e6d7bd]" },
  { id: "light", label: "בהיר", icon: Sun, preview: "from-[#fffbf6] to-[#f0e8dc]" },
  { id: "dark", label: "כהה", icon: Moon, preview: "from-[#3d4f5f] to-[#2a3844]" },
];

function styleById(id: CustomerDisplayTheme) {
  return STYLES.find((s) => s.id === id) ?? STYLES[0];
}

export function DashboardStoreStylePicker({
  initialTheme,
  previewOnly = false,
}: {
  initialTheme: CustomerDisplayTheme;
  previewOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<CustomerDisplayTheme>(initialTheme);
  const [saving, setSaving] = useState(false);
  const current = styleById(theme);

  async function select(next: CustomerDisplayTheme) {
    setTheme(next);
    if (previewOnly) return;
    setSaving(true);
    try {
      await fetch("/api/dashboard/store-theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeTheme: next }),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    const Icon = current.icon;
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bakery-float-tile mx-auto flex w-full max-w-[280px] flex-col items-center gap-3 rounded-[20px] px-4 py-5 sm:max-w-[320px]"
      >
        <span
          className={`flex h-14 w-full items-center justify-center rounded-[14px] bg-gradient-to-b ${current.preview}`}
        >
          <Icon
            className={`h-7 w-7 ${current.id === "dark" ? "text-white/90" : "text-bakery-ink"}`}
            strokeWidth={1.75}
          />
        </span>
        <span className="flex items-center gap-2 text-[16px] font-extrabold text-bakery-ink">
          <Palette className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          סגנון לחנות
        </span>
        <span className="text-[13px] font-semibold text-bakery-muted">
          נבחר: {current.label}
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
      >
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" strokeWidth={2} />
        חזרה
      </button>

      <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">
        סגנון לחנות
      </h2>
      <p className="text-center text-[13px] font-semibold text-bakery-muted">
        בחרו איך החנות נראית ללקוחות
      </p>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {STYLES.map((s) => {
          const Icon = s.icon;
          const active = theme === s.id;
          return (
            <button
              key={s.id}
              type="button"
              disabled={saving}
              onClick={() => select(s.id)}
              className={`bakery-float-tile flex flex-col items-center gap-2 rounded-[18px] px-2 py-3 ${
                active ? "bakery-float-tile--active ring-2 ring-bakery-primary/35" : ""
              }`}
            >
              <span
                className={`flex h-12 w-full items-center justify-center rounded-[12px] bg-gradient-to-b ${s.preview}`}
              >
                <Icon
                  className={`h-6 w-6 ${s.id === "dark" ? "text-white/90" : "text-bakery-ink"}`}
                  strokeWidth={1.75}
                />
              </span>
              <span className="text-[13px] font-extrabold text-bakery-ink">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
