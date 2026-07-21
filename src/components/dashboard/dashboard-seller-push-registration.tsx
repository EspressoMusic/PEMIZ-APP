"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing } from "lucide-react";
import { Alert, Button } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  getActivePushSubscription,
  isPushSupported,
  requestAndSubscribePush,
} from "@/lib/push-client";

function pushSubscribeErrorMessage(
  error: unknown,
  labels: {
    pushSubscribeError: string;
    pushPermissionDenied: string;
    pushServiceUnavailable: string;
    pushIosNeedsInstall: string;
    pushInvalidVapidKey: string;
    pushServiceWorkerFailed: string;
  }
): string {
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

export function DashboardSellerPushRegistration({
  alertsEnabled,
  previewOnly = false,
  requestSignal = 0,
}: {
  alertsEnabled: boolean;
  previewOnly?: boolean;
  /** Increment this to (re)trigger the browser permission prompt + subscribe, e.g. from the toggle that turned alerts on. */
  requestSignal?: number;
}) {
  const { labels } = useAppLocale();
  const [state, setState] = useState<PushState>("idle");
  const [error, setError] = useState("");
  const lastTriggeredRef = useRef(0);

  const refreshConfig = useCallback(async () => {
    if (previewOnly || !isPushSupported()) {
      setState(isPushSupported() ? "unconfigured" : "unsupported");
      return;
    }
    try {
      const res = await fetch("/api/dashboard/push/config", {
        credentials: "same-origin",
      });
      const data = (await res.json()) as {
        configured?: boolean;
        publicKey?: string | null;
      };
      if (!res.ok || !data.configured || !data.publicKey) {
        setState("unconfigured");
        return;
      }
      if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        setState("denied");
        return;
      }
      const activeSubscription = await getActivePushSubscription().catch(() => null);
      setState(activeSubscription ? "subscribed" : "idle");
    } catch {
      setState("unconfigured");
    }
  }, [previewOnly]);

  useEffect(() => {
    void refreshConfig();
  }, [refreshConfig]);

  const subscribe = useCallback(async () => {
    if (previewOnly) {
      setError(labels.pushPreviewOnly);
      return;
    }

    setError("");
    setState("loading");

    const outcome = await requestAndSubscribePush();
    switch (outcome.status) {
      case "unsupported":
        setState("unsupported");
        return;
      case "unconfigured":
        setState("unconfigured");
        return;
      case "ios_needs_install":
        setError(labels.pushIosNeedsInstall);
        setState("idle");
        return;
      case "denied":
        setState("denied");
        return;
      case "error":
        setError(pushSubscribeErrorMessage(outcome.error, labels));
        setState("idle");
        return;
      case "subscribed":
        setState("subscribed");
        return;
    }
  }, [previewOnly, labels]);

  useEffect(() => {
    if (requestSignal > 0 && requestSignal !== lastTriggeredRef.current) {
      lastTriggeredRef.current = requestSignal;
      void subscribe();
    }
  }, [requestSignal, subscribe]);

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
      ) : state === "loading" ? (
        <p className="text-center text-[13px] font-semibold text-bakery-muted">
          {labels.chatLoading}
        </p>
      ) : (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => void subscribe()}
        >
          {labels.pushSubscribeButton}
        </Button>
      )}

      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}
