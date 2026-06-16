"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Textarea, Alert, Panel, PageTitle, Toggle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";

export default function OnboardingPage() {
  const router = useRouter();
  const [type, setType] = useState<"STORE" | "APPOINTMENTS">("STORE");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!acceptTerms) {
      setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות");
      return;
    }
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        description: fd.get("description") || undefined,
        type,
        acceptTerms: true,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.push("/dashboard?welcome=1");
    router.refresh();
  }

  return (
    <WebShell>
      <div className="mx-auto w-full max-w-lg px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
        <Panel>
          <PageTitle>פתיחת עסק</PageTitle>
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-3">
            <Input name="name" label="שם העסק" required />
            <Textarea name="description" label="תיאור קצר" rows={3} />

            <div>
              <span className="text-[14px] font-bold text-bakery-ink">סוג עסק</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("STORE")}
                  className={`rounded-[18px] border-[1.2px] px-3 py-3 text-[14px] font-bold transition ${
                    type === "STORE"
                      ? "border-bakery-primary bg-bakery-primary/14 text-bakery-ink"
                      : "border-bakery-border/40 bg-bakery-card text-bakery-muted"
                  }`}
                >
                  חנות מוצרים
                </button>
                <button
                  type="button"
                  onClick={() => setType("APPOINTMENTS")}
                  className={`rounded-[18px] border-[1.2px] px-3 py-3 text-[14px] font-bold transition ${
                    type === "APPOINTMENTS"
                      ? "border-bakery-primary bg-bakery-primary/14 text-bakery-ink"
                      : "border-bakery-border/40 bg-bakery-card text-bakery-muted"
                  }`}
                >
                  קביעת תורים
                </button>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 text-[14px] leading-[1.45]">
              <span className="min-w-0 flex-1 text-bakery-muted">
                קראתי ואני מסכים/ה ל
                <Link href="/terms" className="font-bold text-bakery-ink hover:underline">
                  {" "}
                  תנאי השימוש
                </Link>{" "}
                ו
                <Link href="/privacy" className="font-bold text-bakery-ink hover:underline">
                  מדיניות הפרטיות
                </Link>
                .
              </span>
              <Toggle
                enabled={acceptTerms}
                onChange={setAcceptTerms}
                ariaLabel="אישור תנאי שימוש ומדיניות פרטיות"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "יוצר..." : "פתח עסק"}
            </Button>
          </form>
        </Panel>
      </div>
    </WebShell>
  );
}
