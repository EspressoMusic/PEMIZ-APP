"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) setError(decodeURIComponent(err));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user?.business) {
          router.replace("/onboarding");
          return;
        }
        if (d.user?.emailVerified) {
          router.replace("/dashboard");
          return;
        }
        setEmail(d.user.email ?? "");
        setBusinessName(d.user.business?.name ?? "");
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function resend() {
    setError("");
    setInfo("");
    setLoading(true);
    const res = await fetch("/api/auth/verify-email", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "שגיאה");
      return;
    }
    setInfo("נשלח מייל אימות. בדוק את תיבת הדואר (וגם ספאם).");
  }

  if (checking) {
    return (
      <WebShell>
        <div className="py-20 text-center text-bakery-muted">טוען...</div>
      </WebShell>
    );
  }

  return (
    <WebShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <Panel>
          <PageTitle subtitle="לאחר האימות החנות תיפתח והדשבורד יהיה זמין במלואו">
            אימות אימייל
          </PageTitle>

          {businessName && (
            <p className="mb-4 text-[15px] text-bakery-muted">
              החנות <strong className="text-bakery-ink">{businessName}</strong> נוצרה
              וממתינה לאימות אימייל.
            </p>
          )}

          {email && (
            <p className="mb-4 text-[14px] text-bakery-muted" dir="ltr">
              {email}
            </p>
          )}

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

          <p className="mb-4 text-[14px] leading-[1.45] text-bakery-muted">
            שלחנו אליך קישור אימות במייל. אחרי לחיצה על הקישור החנות תופעל ותוכל
            לנהל מוצרים, הזמנות ותורים מהדשבורד.
          </p>

          <Button className="w-full" onClick={resend} disabled={loading}>
            {loading ? "שולח..." : "שלח שוב מייל אימות"}
          </Button>

          <p className="mt-6 text-center text-[14px] text-bakery-muted">
            <Link href="/login" className="font-bold hover:text-bakery-ink">
              התחברות עם חשבון אחר
            </Link>
          </p>
        </Panel>
      </div>
    </WebShell>
  );
}
