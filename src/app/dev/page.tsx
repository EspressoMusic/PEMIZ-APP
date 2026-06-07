"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SLUG_KEY = "linky-dev-slug";
const PROD_URL = "https://linky-red-seven.vercel.app";

export default function DevPreviewPage() {
  const [slug, setSlug] = useState("");

  useEffect(() => {
    setSlug(localStorage.getItem(SLUG_KEY) ?? "");
  }, []);

  function saveSlug(value: string) {
    setSlug(value);
    localStorage.setItem(SLUG_KEY, value.trim());
  }

  const storeHref = slug.trim() ? `/b/${slug.trim()}` : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-bakery-ink">תצוגה מקומית — Linky</h1>
        <p className="mt-2 text-sm text-bakery-muted">
          עריכה ב-Cursor + שמירה → הדף מתעדכן. בלי התחברות ומסד נתונים.
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-bakery-border/40 bg-bakery-cream-light/60 p-4">
        <h2 className="text-sm font-bold text-bakery-ink">מוכר — עריכת עיצוב (מומלץ)</h2>
        <Link
          href="/dev/seller"
          className="rounded-xl bg-bakery-primary px-4 py-3 text-center text-sm font-bold text-bakery-on-primary"
        >
          דשבורד מוכר — חנות מוצרים
        </Link>
        <Link
          href="/dev/seller-appointments"
          className="rounded-xl border border-bakery-border bg-bakery-cream-light px-4 py-3 text-center text-sm font-bold text-bakery-ink"
        >
          דשבורד מוכר — חנות פגישות
        </Link>
        <p className="text-xs text-bakery-muted">
          חנות פגישות וחנות מוצרים נפרדות — הגדרות שונות לכל סוג. /login דורש Supabase ב-.env.local
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-bakery-border/40 bg-bakery-cream-light/60 p-4">
        <h2 className="text-sm font-bold text-bakery-ink">לקוח — עריכת עיצוב</h2>
        <Link
          href="/dev/customer"
          className="rounded-xl bg-bakery-primary px-4 py-3 text-center text-sm font-bold text-bakery-on-primary"
        >
          פתח חנות לקוח (תצוגה)
        </Link>
        <Link
          href="/dev/customer-appointments"
          className="rounded-xl border border-bakery-border bg-bakery-cream-light px-4 py-3 text-center text-sm font-bold text-bakery-ink"
        >
          פתח עסק תורים (תצוגה)
        </Link>
        {storeHref && (
          <Link
            href={storeHref}
            className="rounded-xl border border-bakery-border px-4 py-3 text-center text-sm font-medium text-bakery-ink"
          >
            חנות אמיתית (/b/{slug.trim()}) — דורש DB
          </Link>
        )}
        <label className="text-xs text-bakery-muted">סלאג (אופציונלי, ל-DB)</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => saveSlug(e.target.value)}
          placeholder="my-bakery"
          className="rounded-xl border border-bakery-border/40 bg-bakery-cream-light px-4 py-2 text-sm"
          dir="ltr"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-bakery-muted">אתר חי (התחברות עובדת)</h2>
        <a
          href={`${PROD_URL}/login`}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-bakery-border px-4 py-3 text-center text-sm font-medium text-bakery-ink"
        >
          מוכר ב-Vercel ↗
        </a>
      </section>
    </main>
  );
}
