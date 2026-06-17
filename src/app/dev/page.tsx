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
        <h1 className="text-2xl font-semibold text-bakery-ink">Local preview — Linky</h1>
        <p className="mt-2 text-sm text-bakery-muted">
          Edit in Cursor, save, and the page refreshes. No login or database required.
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-bakery-border/40 bg-bakery-cream-light/60 p-4">
        <h2 className="text-sm font-bold text-bakery-ink">Seller — design preview (recommended)</h2>
        <Link
          href="/dev/seller-appointments"
          className="rounded-xl bg-bakery-primary px-4 py-3 text-center text-sm font-bold text-bakery-on-primary"
        >
          Seller dashboard — appointments store
        </Link>
        <Link
          href="/dev/seller-rental"
          className="rounded-xl border border-bakery-border bg-bakery-cream-light px-4 py-3 text-center text-sm font-bold text-bakery-ink"
        >
          Seller dashboard — rental store
        </Link>
        <Link
          href="/dev/seller"
          className="rounded-xl border border-bakery-border bg-bakery-cream-light px-4 py-3 text-center text-sm font-bold text-bakery-ink"
        >
          Seller dashboard — product store
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/dev/guide"
            className="flex-1 rounded-xl border border-bakery-border/60 px-4 py-2.5 text-center text-xs font-bold text-bakery-ink"
          >
            Onboarding guide — products
          </Link>
          <Link
            href="/dev/guide/appointments"
            className="flex-1 rounded-xl border border-bakery-border/60 px-4 py-2.5 text-center text-xs font-bold text-bakery-ink"
          >
            Onboarding guide — appointments
          </Link>
        </div>
        <p className="text-xs text-bakery-muted">
          Three store types (products, appointments, rental). /login requires Supabase in .env.local
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-bakery-border/40 bg-bakery-cream-light/60 p-4">
        <h2 className="text-sm font-bold text-bakery-ink">Customer — design preview</h2>
        <Link
          href="/dev/customer"
          className="rounded-xl bg-bakery-primary px-4 py-3 text-center text-sm font-bold text-bakery-on-primary"
        >
          Open customer store (preview)
        </Link>
        <Link
          href="/dev/customer-appointments"
          className="rounded-xl border border-bakery-border bg-bakery-cream-light px-4 py-3 text-center text-sm font-bold text-bakery-ink"
        >
          Open appointments store (preview)
        </Link>
        <Link
          href="/dev/customer-rental"
          className="rounded-xl border border-bakery-border bg-bakery-cream-light px-4 py-3 text-center text-sm font-bold text-bakery-ink"
        >
          Open rental store (preview)
        </Link>
        {storeHref && (
          <Link
            href={storeHref}
            className="rounded-xl border border-bakery-border px-4 py-3 text-center text-sm font-medium text-bakery-ink"
          >
            Live store (/b/{slug.trim()}) — requires DB
          </Link>
        )}
        <label className="text-xs text-bakery-muted">Slug (optional, for DB)</label>
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
        <h2 className="text-sm font-medium text-bakery-muted">Live site (login works)</h2>
        <a
          href={`${PROD_URL}/login`}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-bakery-border px-4 py-3 text-center text-sm font-medium text-bakery-ink"
        >
          Seller on Vercel ↗
        </a>
      </section>
    </main>
  );
}
