"use client";

import { useState } from "react";

export function useSubscriptionPortal() {
  const [openingPortal, setOpeningPortal] = useState(false);

  async function openBillingPortal(fallbackError: string) {
    setOpeningPortal(true);
    try {
      const res = await fetch("/api/dashboard/subscription/portal", {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return { ok: true as const };
      }
      return {
        ok: false as const,
        message: data.error ?? fallbackError,
      };
    } catch {
      return { ok: false as const, message: fallbackError };
    } finally {
      setOpeningPortal(false);
    }
  }

  return { openingPortal, openBillingPortal };
}
