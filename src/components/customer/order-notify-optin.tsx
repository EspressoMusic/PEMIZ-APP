"use client";

import { useEffect, useState } from "react";
import { BellRing, Check } from "lucide-react";
import { Alert, Button } from "@/components/ui";
import {
  getActivePushSubscription,
  isPushSupported,
  requestAndSubscribePush,
} from "@/lib/push-client";

type OrderNotifyLabels = {
  orderNotifyMeButton: string;
  orderNotifySubscribed: string;
  pushPermissionDenied: string;
  pushIosNeedsInstall: string;
  pushSubscribeError: string;
};

type Visibility = "checking" | "hidden" | "visible";
type State = "idle" | "loading" | "subscribed";

export function OrderNotifyOptIn({
  slug,
  orderIds,
  labels,
}: {
  slug: string;
  orderIds: string[];
  labels: OrderNotifyLabels;
}) {
  const [visibility, setVisibility] = useState<Visibility>("checking");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPushSupported() || orderIds.length === 0) {
      setVisibility("hidden");
      return;
    }
    let cancelled = false;
    fetch(`/api/public/${slug}/orders/push/config`)
      .then((res) => res.json())
      .then((data: { configured?: boolean; publicKey?: string | null }) => {
        if (cancelled) return;
        setVisibility(data.configured && data.publicKey ? "visible" : "hidden");
      })
      .catch(() => {
        if (!cancelled) setVisibility("hidden");
      });
    return () => {
      cancelled = true;
    };
  }, [slug, orderIds.length]);

  useEffect(() => {
    if (visibility !== "visible") return;
    let cancelled = false;
    setState("loading");
    (async () => {
      const existing = await getActivePushSubscription().catch(() => null);
      if (cancelled) return;
      const json = existing?.toJSON();
      if (!json?.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setState("idle");
        return;
      }
      const res = await fetch(`/api/public/${slug}/orders/push/subscribe`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds,
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        }),
      }).catch(() => null);
      if (!cancelled) setState(res?.ok ? "subscribed" : "idle");
    })();
    return () => {
      cancelled = true;
    };
  }, [visibility, slug, orderIds]);

  if (visibility !== "visible") return null;

  async function subscribe() {
    setError("");
    setState("loading");
    const outcome = await requestAndSubscribePush(
      `/api/public/${slug}/orders/push/config`,
      `/api/public/${slug}/orders/push/subscribe`,
      { orderIds }
    );
    if (outcome.status === "subscribed") {
      setState("subscribed");
      return;
    }
    if (outcome.status === "denied") {
      setError(labels.pushPermissionDenied);
    } else if (outcome.status === "ios_needs_install") {
      setError(labels.pushIosNeedsInstall);
    } else if (outcome.status !== "unconfigured" && outcome.status !== "unsupported") {
      setError(labels.pushSubscribeError);
    }
    setState("idle");
  }

  if (state === "subscribed") {
    return (
      <Alert variant="success" className="flex items-center justify-center gap-2 rounded-full text-center text-[13px] font-bold">
        <Check className="h-4 w-4" strokeWidth={2.5} />
        {labels.orderNotifySubscribed}
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        onClick={() => void subscribe()}
        disabled={state === "loading"}
        className="w-full gap-2 rounded-full text-[14px] font-extrabold text-bakery-primary"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bakery-primary) 18%, var(--bakery-card))",
          borderWidth: "2.5px",
          borderColor: "var(--bakery-primary)",
        }}
      >
        <BellRing className="h-4 w-4" strokeWidth={2} />
        {labels.orderNotifyMeButton}
      </Button>
      {error ? (
        <p className="text-center text-[12px] font-semibold text-bakery-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
