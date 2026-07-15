"use client";

import { useState } from "react";
import type { MarketingCopy, MarketingLocale } from "@/lib/marketing-locale";

export function MarketingDemoBookingForm({
  locale,
  copy,
  className = "contact-form",
}: {
  locale: MarketingLocale;
  copy: MarketingCopy;
  className?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/public/demo-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: String(fd.get("name") ?? "").trim(),
          customerEmail: String(fd.get("email") ?? "").trim(),
          customerPhone: String(fd.get("phone") ?? "").trim() || undefined,
          notes: String(fd.get("notes") ?? "").trim() || undefined,
          locale,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? copy.demoBookError);
        return;
      }
      setSent(true);
      form.reset();
      setTimeout(() => setSent(false), 5000);
    } catch {
      setError(copy.demoBookError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={className} data-reveal="right" onSubmit={handleSubmit}>
      <span className="contact-form-eyebrow">{copy.demoBookEyebrow}</span>

      <label>
        <span>{copy.formName}</span>
        <input
          type="text"
          name="name"
          placeholder={copy.formNamePlaceholder}
          required
          disabled={submitting}
        />
      </label>
      <label>
        <span>{copy.formEmail}</span>
        <input
          type="email"
          name="email"
          placeholder={copy.formEmailPlaceholder}
          required
          disabled={submitting}
        />
      </label>
      <label>
        <span>{copy.demoBookPhone}</span>
        <input
          type="tel"
          name="phone"
          placeholder={copy.demoBookPhonePlaceholder}
          disabled={submitting}
        />
      </label>
      <label>
        <span>{copy.demoBookNotes}</span>
        <textarea
          name="notes"
          rows={4}
          placeholder={copy.demoBookNotesPlaceholder}
          disabled={submitting}
        />
      </label>

      <p className="demo-booking-hint">{copy.demoMeetHint}</p>

      {error ? <p className="demo-booking-error">{error}</p> : null}

      <button className="btn btn-primary btn-big" type="submit" disabled={submitting}>
        {sent ? copy.demoBookSent : submitting ? "…" : copy.demoBookSubmit}
      </button>
    </form>
  );
}
