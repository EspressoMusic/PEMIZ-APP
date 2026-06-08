"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    setDevResetUrl(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = fd.get("email");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        devResetUrl?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "משהו השתבש — נסה שוב");
        return;
      }

      setDone(true);
      setInfo(
        data.message ??
          "אם קיים חשבון עם האימייל הזה, נשלח אליך קישור לאיפוס הסיסמה."
      );
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch {
      setError("אין חיבור לשרת — בדוק אינטרנט ונסה שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <WebShell lockViewport>
      <div className="auth-surface mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
        <Panel className="dashboard-card sm:p-8">
          <PageTitle subtitle="נשלח אליך קישור לאיפוס הסיסמה במייל">
            שכחת סיסמה?
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
          {devResetUrl && (
            <div className="mb-4">
              <Alert variant="info">
                מצב פיתוח —{" "}
                <a href={devResetUrl} className="font-bold underline" dir="ltr">
                  לחץ לאיפוס סיסמה
                </a>
              </Alert>
            </div>
          )}

          {!done ? (
            <form onSubmit={onSubmit} className="space-y-3">
              <Input
                name="email"
                type="email"
                label="אימייל"
                required
                autoComplete="email"
                dir="ltr"
              />
              <Button type="submit" className="mt-2 w-full" disabled={loading}>
                {loading ? "שולח..." : "שלח קישור לאיפוס"}
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              className="w-full"
              variant="secondary"
              onClick={() => {
                setDone(false);
                setInfo("");
                setDevResetUrl(null);
              }}
            >
              שלח שוב
            </Button>
          )}
        </Panel>

        <p className="mt-6 text-center text-[17px] leading-snug text-bakery-muted">
          <Link
            href="/login"
            className="text-[19px] font-extrabold text-bakery-primary underline-offset-2 hover:underline"
          >
            חזרה להתחברות
          </Link>
        </p>
      </div>
    </WebShell>
  );
}
