"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Textarea, Alert, Panel, PageTitle } from "@/components/ui";
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
    router.push("/pending-approval");
    router.refresh();
  }

  return (
    <WebShell>
      <div className="mx-auto max-w-lg px-4 py-10">
        <Panel>
          <PageTitle subtitle="בחר סוג עסק — קישור ללקוחות ייווצר אוטומטית">
            פתיחת עסק
          </PageTitle>
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-3">
            <Input name="name" label="שם העסק" required />
            <Textarea name="description" label="תיאור קצר (אופציונלי)" rows={3} />

            <div>
              <span className="text-[14px] font-bold text-bakery-ink">סוג עסק</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    ["STORE", "חנות מוצרים"],
                    ["APPOINTMENTS", "קביעת תורים"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={`rounded-[18px] border-[1.2px] px-3 py-3 text-[14px] font-bold transition ${
                      type === value
                        ? "border-bakery-primary bg-bakery-primary/14 text-bakery-ink"
                        : "border-bakery-border/40 bg-bakery-card text-bakery-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-2 text-[14px] leading-[1.45]">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 accent-bakery-primary"
              />
              <span className="text-bakery-muted">
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
            </label>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "יוצר..." : "פתח עסק"}
            </Button>
          </form>
        </Panel>
      </div>
    </WebShell>
  );
}
