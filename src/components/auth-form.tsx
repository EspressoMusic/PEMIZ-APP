"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";

export function AuthForm({
  mode,
  footer,
}: {
  mode: "login" | "signup";
  footer?: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupConfetti, setSignupConfetti] = useState(mode === "signup");

  useEffect(() => {
    if (mode === "login" && searchParams.get("reset") === "1") {
      setInfo("הסיסמה עודכנה — אפשר להתחבר עם הסיסמה החדשה");
    }
  }, [mode, searchParams]);

  useEffect(() => {
    if (mode !== "signup") return;
    setSignupConfetti(true);
    const timer = window.setTimeout(() => setSignupConfetti(false), 5000);
    return () => window.clearTimeout(timer);
  }, [mode]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload =
      mode === "signup"
        ? {
            phone: fd.get("phone"),
            password: fd.get("password"),
            name: fd.get("name"),
          }
        : {
            identifier: fd.get("identifier"),
            password: fd.get("password"),
          };

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        role?: string;
        hasBusiness?: boolean;
        redirectTo?: string;
      };

      if (!res.ok) {
        if (res.status >= 500 && data.error) {
          setError(data.error);
          return;
        }
        setError(
          data.error ??
            (res.status === 401
              ? mode === "login"
                ? "לא הצלחנו להתחבר — בדוק טלפון וסיסמה"
                : "לא הצלחנו ליצור חשבון"
              : res.status >= 500
                ? "יש תקלה טכנית זמנית במערכת. נסה שוב מאוחר יותר."
                : "משהו השתבש — נסה שוב")
        );
        return;
      }

      if (mode === "signup") {
        router.push("/onboarding");
      } else if (data.redirectTo) {
        router.push(data.redirectTo);
      } else if (!data.hasBusiness) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("אין חיבור לשרת — בדוק אינטרנט ונסה שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <WebShell lockViewport>
      {mode === "signup" && <DashboardConfettiBackground active={signupConfetti} />}
      <div className="auth-surface mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
        <Panel className="dashboard-card sm:p-8">
          <PageTitle>
            {mode === "login" ? "התחברות" : "פתיחת חשבון"}
          </PageTitle>
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          {info && (
            <div className="mb-4">
              <Alert variant="success">{info}</Alert>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <Input name="name" label="שם מלא" required autoComplete="name" />
            )}
            {mode === "signup" ? (
              <Input
                name="phone"
                type="tel"
                label="טלפון נייד"
                required
                autoComplete="tel"
                dir="ltr"
                placeholder="050-1234567"
              />
            ) : (
              <Input
                name="identifier"
                type="tel"
                label="טלפון"
                required
                autoComplete="tel"
                dir="ltr"
                placeholder="050-1234567"
              />
            )}
            <Input
              name="password"
              type="password"
              label="סיסמה"
              required
              minLength={6}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              dir="ltr"
            />
            {mode === "login" ? (
              <p className="text-end">
                <Link
                  href="/forgot-password"
                  className="text-[14px] font-bold text-bakery-primary underline-offset-2 hover:underline"
                >
                  שכחת סיסמה?
                </Link>
              </p>
            ) : null}
            <Button type="submit" className="mt-2 w-full" disabled={loading}>
              {loading ? "רגע..." : mode === "login" ? "התחבר" : "הירשם"}
            </Button>
          </form>
          {mode === "signup" && (
            <p className="mt-4 text-center text-[12px] leading-[1.35] text-bakery-muted">
              בהרשמה אתה מסכים לתנאי השימוש ומדיניות הפרטיות
            </p>
          )}
        </Panel>
        {footer}
      </div>
    </WebShell>
  );
}
