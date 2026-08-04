"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button } from "@/components/ui";
import {
  getActivePushSubscription,
  isPushSupported,
  requestAndSubscribePush,
} from "@/lib/push-client";

type PushState = "idle" | "loading" | "subscribed" | "denied" | "unsupported" | "unconfigured";

function subscribeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "invalid_vapid_public_key") {
      return "מפתח ההתראות בשרת לא תקין.";
    }
    if (
      error.message === "service_worker_unsupported" ||
      error.message.startsWith("service_worker_failed:")
    ) {
      return "לא הצלחנו לרשום את שירות ההתראות בדפדפן.";
    }
    const msg = error.message.toLowerCase();
    if (error.name === "NotAllowedError" || msg.includes("permission") || msg.includes("denied")) {
      return "ההרשאה להתראות נדחתה.";
    }
  }
  return "שגיאה בהרשמה להתראות — נסו שוב.";
}

/** גרסה מצומצמת של DashboardSellerPushRegistration עבור פאנל המתכנת — עברית בלבד, בלי שכבת i18n. */
export function MasterPushRegistration({ previewOnly = false }: { previewOnly?: boolean }) {
  const [state, setState] = useState<PushState>("idle");
  const [error, setError] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "delivered" | "failed" | "none">(
    "idle"
  );
  const mountedRef = useRef(true);
  useEffect(() => () => void (mountedRef.current = false), []);

  const refreshConfig = useCallback(async () => {
    if (previewOnly || !isPushSupported()) {
      setState(isPushSupported() ? "unconfigured" : "unsupported");
      return;
    }
    try {
      const res = await fetch("/api/admin/push/config", { credentials: "same-origin" });
      const data = (await res.json()) as { configured?: boolean; publicKey?: string | null };
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
      setError("לא זמין בתצוגת פיתוח.");
      return;
    }
    setError("");
    setState("loading");

    const outcome = await requestAndSubscribePush("/api/admin/push/config", "/api/admin/push/subscribe");
    if (!mountedRef.current) return;
    switch (outcome.status) {
      case "unsupported":
        setState("unsupported");
        return;
      case "unconfigured":
        setState("unconfigured");
        return;
      case "ios_needs_install":
        setError("באייפון צריך להתקין את האתר כאפליקציה (הוספה למסך הבית) לפני הפעלת התראות.");
        setState("idle");
        return;
      case "denied":
        setState("denied");
        return;
      case "error":
        setError(subscribeErrorMessage(outcome.error));
        setState("idle");
        return;
      case "subscribed":
        setState("subscribed");
        return;
    }
  }, [previewOnly]);

  const sendTest = useCallback(async () => {
    setTestStatus("sending");
    try {
      const res = await fetch("/api/admin/push/test", { method: "POST", credentials: "same-origin" });
      const data = (await res.json().catch(() => ({}))) as {
        delivered?: number;
        totalSubscriptions?: number;
      };
      if (!res.ok || !data.totalSubscriptions) {
        setTestStatus("none");
      } else if ((data.delivered ?? 0) > 0) {
        setTestStatus("delivered");
      } else {
        setTestStatus("failed");
      }
    } catch {
      setTestStatus("failed");
    }
  }, []);

  if (state === "unsupported") {
    return <Alert variant="info">הדפדפן הזה לא תומך בהתראות דחיפה.</Alert>;
  }

  if (state === "unconfigured") {
    return <Alert variant="info">התראות דחיפה לא מוגדרות בשרת כרגע.</Alert>;
  }

  return (
    <div className="space-y-3 text-start">
      <p className="text-[14px] text-bakery-muted">
        קבלו התראה לנייד ברגע שמשתמש חדש נרשם או שעסק חדש משלים הרשמה.
      </p>

      {state === "subscribed" ? (
        <div className="space-y-2">
          <Alert variant="success">ההתראות פעילות במכשיר הזה.</Alert>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={testStatus === "sending"}
            onClick={() => void sendTest()}
          >
            {testStatus === "sending" ? "שולח..." : "שלח התראת בדיקה"}
          </Button>
          {testStatus === "delivered" ? (
            <Alert variant="success">נשלחה בהצלחה!</Alert>
          ) : testStatus === "failed" ? (
            <Alert variant="error">השליחה נכשלה.</Alert>
          ) : testStatus === "none" ? (
            <Alert variant="error">אין מכשיר רשום.</Alert>
          ) : null}
        </div>
      ) : state === "denied" ? (
        <Alert variant="error">ההרשאה להתראות נדחתה בדפדפן — יש לאפשר אותה בהגדרות האתר.</Alert>
      ) : state === "loading" ? (
        <p className="text-center text-[13px] font-semibold text-bakery-muted">טוען...</p>
      ) : (
        <Button type="button" variant="primary" className="w-full" onClick={() => void subscribe()}>
          הפעל התראות במכשיר הזה
        </Button>
      )}

      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}
