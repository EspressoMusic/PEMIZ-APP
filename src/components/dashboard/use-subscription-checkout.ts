"use client";

import { useState } from "react";
import type { SubscriptionPlanId } from "@/lib/subscription-plans";

const PAYMENTS_DISABLED_MESSAGE =
  "Subscription checkout is not available yet. Your store stays active for now.";

export function useSubscriptionCheckout() {
  const [payingPlan, setPayingPlan] = useState<SubscriptionPlanId | null>(null);
  const [message, setMessage] = useState("");

  async function startCheckout(
    planId: SubscriptionPlanId,
    fallbackError: string
  ) {
    setPayingPlan(planId);
    setMessage("");
    try {
      const res = await fetch("/api/dashboard/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (res.status === 503) {
        setMessage(data.error ?? PAYMENTS_DISABLED_MESSAGE);
        return;
      }
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage(data.error ?? fallbackError);
    } catch {
      setMessage(fallbackError);
    } finally {
      setPayingPlan(null);
    }
  }

  return { payingPlan, message, setMessage, startCheckout };
}
