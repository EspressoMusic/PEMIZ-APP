"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Alert } from "@/components/ui";
import { Toggle } from "@/components/ui-toggle";
import {
  isIosDevice,
  isInstalledPwa,
  isPushSupported,
  subscribeToPush,
} from "@/lib/push-client";

type PushLabels = {
  pushEnableTitle: string;
  pushEnableHint: string;
  pushSubscribeButton: string;
  pushSubscribed: string;
  pushPermissionDenied: string;
  pushUnsupported: string;
  pushUnconfigured: string;
  pushSubscribeError: string;
  pushServiceUnavailable: string;
  pushIosNeedsInstall: string;
  pushInvalidVapidKey: string;
  pushServiceWorkerFailed: string;
};

function pushSubscribeErrorMessage(error: unknown, labels: PushLabels): string {
  if (error instanceof Error) {
    if (error.message === "invalid_vapid_public_key") {
      return labels.pushInvalidVapidKey;
    }
    if (
      error.message === "service_worker_unsupported" ||
      error.message.startsWith("service_worker_failed:")
    ) {
      return labels.pushServiceWorkerFailed;
    }
    const msg = error.message.toLowerCase();
    if (
      error.name === "NotAllowedError" ||
      msg.includes("permission") ||
      msg.includes("denied")
    ) {
      return labels.pushPermissionDenied;
    }
    if (
      error.name === "AbortError" ||
      error.name === "InvalidAccessError" ||
      msg.includes("push service") ||
      msg.includes("not available") ||
      msg.includes("applicationserverkey")
    ) {
      return labels.pushServiceUnavailable;
    }
  }
  return labels.pushSubscribeError;
}

type PushState = "idle" | "loading" | "subscribed" | "denied" | "unsupported" | "unconfigured";

export function CustomerPushRegistration({
  slug,
  labels,
}: {
  slug: string;
  labels: PushLabels;
}) {
  const [state, setState] = useState<PushState>("idle");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refreshConfig = useCallback(async () => {
    if (!isPushSupported()) {
      setState("unsupported");
      return;
    }
    try {
      const res = await fetch(`/api/public/${slug}/push/config`);
      const data = (await res.json()) as {
        configured?: boolean;
        publicKey?: string | null;
      };
      if (!res.ok || !data.configured || !data.publicKey) {
        setState("unconfigured");
        setPublicKey(null);
        return;
      }
      setPublicKey(data.publicKey);
      setState("idle");
    } catch {
      setState("unconfigured");
    }
  }, [slug]);

  useEffect(() => {
    void refreshConfig();
  }, [refreshConfig]);

  async function subscribe() {
    if (!publicKey) {
      setError(labels.pushUnconfigured);
      return;
    }
    if (!isPushSupported()) {
      setState("unsupported");
      return;
    }

    if (isIosDevice() && !isInstalledPwa()) {
      setError(labels.pushIosNeedsInstall);
      setState("idle");
      return;
    }

    setError("");
    setState("loading");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return;
      }

      const subscription = await subscribeToPush(publicKey);

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setError(labels.pushSubscribeError);
        setState("idle");
        return;
      }

      const res = await fetch(`/api/public/${slug}/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? labels.pushSubscribeError);
        setState("idle");
        return;
      }

      setState("subscribed");
    } catch (error) {
      setError(pushSubscribeErrorMessage(error, labels));
      setState("idle");
    }
  }

  if (state === "unsupported") {
    return <Alert variant="info">{labels.pushUnsupported}</Alert>;
  }

  if (state === "unconfigured") {
    return <Alert variant="info">{labels.pushUnconfigured}</Alert>;
  }

  const subscribed = state === "subscribed";
  const loading = state === "loading";

  return (
    <div className="w-full space-y-2">
      <div className="flex w-full items-center justify-between gap-3 rounded-[22px] border-[3px] border-[#6D4C41]/22 bg-bakery-card/80 px-4 py-4 text-start">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-bakery-square/70">
            <BellRing className="h-5 w-5 text-bakery-primary" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold text-bakery-ink">
              {labels.pushEnableTitle}
            </p>
            <p className="mt-0.5 text-[13px] font-semibold leading-relaxed text-bakery-muted">
              {labels.pushEnableHint}
            </p>
          </div>
        </div>
        <Toggle
          enabled={subscribed}
          onChange={() => {
            if (!subscribed && !loading) void subscribe();
          }}
          ariaLabel={labels.pushSubscribeButton}
          disabled={loading || subscribed}
        />
      </div>

      {state === "denied" ? (
        <Alert variant="error">{labels.pushPermissionDenied}</Alert>
      ) : null}
      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}
