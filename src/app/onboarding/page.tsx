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
      setError("Please accept the Terms of Service and Privacy Policy");
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
          <PageTitle>Open your business</PageTitle>
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-3">
            <Input name="name" label="Business name" required />
            <Textarea name="description" label="Short description" rows={3} />

            <div>
              <span className="text-[14px] font-bold text-bakery-ink">Store type</span>
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
                  Product store
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
                  Appointments
                </button>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 text-[14px] leading-[1.45]">
              <span className="min-w-0 flex-1 text-bakery-muted">
                I have read and agree to the{" "}
                <Link href="/terms" className="font-bold text-bakery-ink hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-bold text-bakery-ink hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
              <Toggle
                enabled={acceptTerms}
                onChange={setAcceptTerms}
                ariaLabel="Accept terms and privacy policy"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Open store"}
            </Button>
          </form>
        </Panel>
      </div>
    </WebShell>
  );
}
