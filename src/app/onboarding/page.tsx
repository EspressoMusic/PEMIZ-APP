"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Alert, Panel, PageTitle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";

export default function OnboardingPage() {
  const router = useRouter();
  const { copy } = useMarketingLocale();
  const [type, setType] = useState<"STORE" | "APPOINTMENTS">("STORE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    <WebShell lockViewport>
      <div className="auth-surface mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
        <Panel className="dashboard-card sm:p-8">
          <PageTitle>{copy.onboardTitle}</PageTitle>
          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-3">
            <Input name="name" label={copy.onboardBusinessName} required />
            <Textarea
              name="description"
              label={copy.onboardDescription}
              rows={3}
            />

            <div>
              <span className="text-[14px] font-bold text-bakery-ink">
                {copy.onboardStoreType}
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("STORE")}
                  className={`rounded-[18px] border-2 px-3 py-3 text-[14px] font-bold transition ${
                    type === "STORE"
                      ? "border-bakery-primary bg-bakery-primary text-bakery-on-primary shadow-[0_2px_8px_rgba(93,64,55,0.25)]"
                      : "border-bakery-primary/55 bg-white text-bakery-ink shadow-[inset_0_1px_2px_rgba(78,52,46,0.06)]"
                  }`}
                >
                  {copy.onboardProductStore}
                </button>
                <button
                  type="button"
                  onClick={() => setType("APPOINTMENTS")}
                  className={`rounded-[18px] border-2 px-3 py-3 text-[14px] font-bold transition ${
                    type === "APPOINTMENTS"
                      ? "border-bakery-primary bg-bakery-primary text-bakery-on-primary shadow-[0_2px_8px_rgba(93,64,55,0.25)]"
                      : "border-bakery-primary/55 bg-white text-bakery-ink shadow-[inset_0_1px_2px_rgba(78,52,46,0.06)]"
                  }`}
                >
                  {copy.onboardAppointments}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home mt-2 !w-full !rounded-full !shadow-none hover:!opacity-100"
              disabled={loading}
            >
              {loading ? copy.onboardCreating : copy.onboardSubmit}
            </Button>
          </form>
        </Panel>
      </div>
    </WebShell>
  );
}
