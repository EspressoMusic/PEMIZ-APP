"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      email: fd.get("email"),
      password: fd.get("password"),
      ...(mode === "signup" ? { name: fd.get("name") } : {}),
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
      };

      if (!res.ok) {
        setError(
          data.error ??
            (res.status >= 500
              ? "שגיאת שרת — ודא שמסד הנתונים מחובר והפעל מחדש את npm run dev"
              : "שגיאה")
        );
        return;
      }

      if (mode === "signup") {
        router.push("/onboarding");
      } else if (data.role === "ADMIN") {
        router.push("/master");
      } else if (!data.hasBusiness) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("לא הצלחנו להתחבר — בדוק חיבור לאינטרנט ונסה שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <WebShell>
      <div className="mx-auto w-full max-w-md px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
        <Panel>
          <PageTitle
            subtitle={
              mode === "login"
                ? "התחבר לחשבון העסק שלך"
                : "צור חשבון ובנה עמוד דיגיטלי"
            }
          >
            {mode === "login" ? "התחברות" : "פתיחת חשבון"}
          </PageTitle>
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <Input name="name" label="שם מלא" required autoComplete="name" />
            )}
            <Input
              name="email"
              type="email"
              label="אימייל"
              required
              autoComplete="email"
              dir="ltr"
            />
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
      </div>
    </WebShell>
  );
}
