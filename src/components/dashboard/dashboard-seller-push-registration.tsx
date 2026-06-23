"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Alert, Button } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  isIosDevice,
  isInstalledPwa,
  isPushSupported,
  subscribeToSellerPush,
} from "@/lib/push-client";

function pushSubscribeErrorMessage(
  error: unknown,
  labels: {
    pushSubscribeError: string;
    pushPermissionDenied: string;
    pushServiceUnavailable: string;
    pushIosNeedsInstall: string;
  }
): string {
  if (error instanceof Error) {
    if (error.message === "service_worker_unavailable") {
      return labels.pushSubscribeError;
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
      msg.includes("push service") ||
      msg.includes("not available")
    ) {
      return labels.pushServiceUnavailable;
    }
  }
  return labels.pushSubscribeError;
}

type PushState = "idle" | "loading" | "subscribed" | "denied" | "unsupported" | "unconfigured";

export function DashboardSellerPushRegistration({
  alertsEnabled,
  previewOnly = false,
}: {
  alertsEnabled: boolean;
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const [state, setState] = useState<PushState>("idle");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refreshConfig = useCallback(async () => {
    if (previewOnly || !isPushSupported()) {
      setState(isPushSupported() ? "unconfigured" : "unsupported");
      return;
    }
    try {
      const res = await fetch("/api/dashboard/push/config");
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
  }, [previewOnly]);

  useEffect(() => {
    void refreshConfig();
  }, [refreshConfig]);

  async function subscribe() {
    if (previewOnly) {
      setError(labels.pushPreviewOnly);
      return;
    }
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

      const subscription = await subscribeToSellerPush(publicKey);

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setError(labels.pushSubscribeError);
        setState("idle");
        return;
      }

      const res = await fetch("/api/dashboard/push/subscribe", {
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

  if (!alertsEnabled) return null;

  if (state === "unsupported") {
    return (
      <Alert variant="info">{labels.pushUnsupported}</Alert>
    );
  }

  if (state === "unconfigured") {
    return (
      <Alert variant="info">{labels.pushUnconfigured}</Alert>
    );
  }

  return (
    <div className="w-full space-y-3 border-t border-bakery-border/25 pt-3">
      <div className="flex items-start gap-2 text-center sm:text-start">
        <span className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-bakery-square/60 sm:mx-0">
          <BellRing className="h-5 w-5 text-bakery-primary" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold text-bakery-ink">
            {labels.pushEnableTitle}
          </p>
          <p className="mt-1 text-[13px] font-semibold leading-relaxed text-bakery-muted">
            {labels.pushEnableHint}
          </p>
        </div>
      </div>

      {state === "subscribed" ? (
        <Alert variant="success">{labels.pushSubscribed}</Alert>
      ) : state === "denied" ? (
        <Alert variant="error">{labels.pushPermissionDenied}</Alert>
      ) : (
        <Button
          type="button"
          className="w-full"
          disabled={state === "loading"}
          onClick={() => void subscribe()}
        >
          {state === "loading" ? labels.chatLoading : labels.pushSubscribeButton}
        </Button>
      )}

      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}
