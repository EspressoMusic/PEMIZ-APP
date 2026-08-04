"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Alert, Panel, PageTitle, Toggle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";
import { BUSINESS_TRIAL_DAYS } from "@/lib/business-trial";

function OnboardFeatureToggleRow({
  label,
  hint,
  enabled,
  onChange,
}: {
  label: string;
  hint: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="w-full rounded-2xl border-2 border-bakery-border bg-bakery-square px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold text-bakery-ink">{label}</span>
          <span className="mt-1 block text-[12px] font-medium leading-snug text-bakery-muted">
            {hint}
          </span>
        </div>
        <Toggle enabled={enabled} onChange={onChange} ariaLabel={label} variant="auth" />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { copy, locale } = useMarketingLocale();
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<"STORE" | "APPOINTMENTS">("STORE");
  const [simpleMode, setSimpleMode] = useState(true);
  const [orderConfirmationRequired, setOrderConfirmationRequired] = useState(false);
  const [appointmentConfirmationRequired, setAppointmentConfirmationRequired] =
    useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!acceptTerms) {
      setError(copy.onboardTermsError);
      return;
    }
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        description: fd.get("description") || undefined,
        type,
        acceptTerms,
        dashboardSimpleMode: simpleMode,
        ...(type === "STORE"
          ? {
              reviews: !simpleMode,
              coupons: !simpleMode,
              deals: !simpleMode,
              chat: !simpleMode,
              orderConfirmationRequired,
            }
          : { appointmentConfirmationRequired }),
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
          {step === 1 ? (
            <>
              <PageTitle>{copy.onboardStepChooseTitle}</PageTitle>
              <div className="space-y-4">
                <div>
                  <span className="text-[14px] font-bold text-bakery-ink">
                    {copy.onboardStoreType}
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType("STORE")}
                      className={`onboard-3d-option flex flex-col items-center gap-1 rounded-2xl px-3 py-3.5 text-center ${
                        type === "STORE" ? "bakery-cta-3d--primary" : "bakery-cta-3d--secondary"
                      }`}
                    >
                      <span className="text-[14px] font-bold">
                        {copy.onboardProductStore}
                      </span>
                      <span
                        className={`text-[11px] font-medium leading-snug ${
                          type === "STORE" ? "opacity-90" : "text-bakery-muted"
                        }`}
                      >
                        {copy.onboardProductStoreHint}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("APPOINTMENTS")}
                      className={`onboard-3d-option flex flex-col items-center gap-1 rounded-2xl px-3 py-3.5 text-center ${
                        type === "APPOINTMENTS"
                          ? "bakery-cta-3d--primary"
                          : "bakery-cta-3d--secondary"
                      }`}
                    >
                      <span className="text-[14px] font-bold">
                        {copy.onboardAppointments}
                      </span>
                      <span
                        className={`text-[11px] font-medium leading-snug ${
                          type === "APPOINTMENTS" ? "opacity-90" : "text-bakery-muted"
                        }`}
                      >
                        {copy.onboardAppointmentsHint}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[14px] font-bold text-bakery-ink">
                    {copy.onboardModeTitle}
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimpleMode(true)}
                      className={`onboard-3d-option flex flex-col items-center gap-1 rounded-2xl px-3 py-3.5 text-center ${
                        simpleMode ? "bakery-cta-3d--primary" : "bakery-cta-3d--secondary"
                      }`}
                    >
                      <span className="text-[14px] font-bold">
                        {copy.onboardModeSimple}
                      </span>
                      <span
                        className={`text-[11px] font-medium leading-snug ${
                          simpleMode ? "opacity-90" : "text-bakery-muted"
                        }`}
                      >
                        {copy.onboardModeSimpleShortHint}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimpleMode(false)}
                      className={`onboard-3d-option flex flex-col items-center gap-1 rounded-2xl px-3 py-3.5 text-center ${
                        !simpleMode ? "bakery-cta-3d--primary" : "bakery-cta-3d--secondary"
                      }`}
                    >
                      <span className="text-[14px] font-bold">
                        {copy.onboardModeAdvanced}
                      </span>
                      <span
                        className={`text-[11px] font-medium leading-snug ${
                          !simpleMode ? "opacity-90" : "text-bakery-muted"
                        }`}
                      >
                        {copy.onboardModeAdvancedShortHint}
                      </span>
                    </button>
                  </div>
                </div>

                {type === "STORE" ? (
                  <OnboardFeatureToggleRow
                    label={copy.onboardFeatureOrderConfirmation}
                    hint={copy.onboardFeatureOrderConfirmationHint}
                    enabled={orderConfirmationRequired}
                    onChange={setOrderConfirmationRequired}
                  />
                ) : (
                  <OnboardFeatureToggleRow
                    label={copy.onboardFeatureAppointmentConfirmation}
                    hint={copy.onboardFeatureAppointmentConfirmationHint}
                    enabled={appointmentConfirmationRequired}
                    onChange={setAppointmentConfirmationRequired}
                  />
                )}

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home mt-2 !w-full !rounded-full !shadow-none hover:!opacity-100"
                >
                  {copy.onboardContinue}
                </Button>
              </div>
            </>
          ) : (
            <>
              <PageTitle subtitle={copy.onboardTrialNote(BUSINESS_TRIAL_DAYS)}>
                {copy.onboardTitle}
              </PageTitle>
              {error && (
                <div className="mb-4">
                  <Alert variant="error">{error}</Alert>
                </div>
              )}
              <form onSubmit={onSubmit} className="space-y-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[13px] font-bold text-bakery-ink hover:underline"
                >
                  ← {copy.onboardBack}
                </button>

                <Input name="name" label={copy.onboardBusinessName} required />
                <Textarea
                  name="description"
                  label={copy.onboardDescription}
                  rows={3}
                />

                <label className="flex items-start gap-2 text-[13px] leading-snug text-bakery-muted">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    aria-label={copy.onboardAcceptTermsAria}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-bakery-ink"
                  />
                  <span>
                    {copy.onboardAcceptTermsPrefix}{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-bold text-bakery-ink hover:underline"
                    >
                      {locale === "he" ? "תנאי השימוש" : "Terms of Service"}
                    </Link>{" "}
                    {copy.onboardAcceptTermsMiddle}{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="font-bold text-bakery-ink hover:underline"
                    >
                      {locale === "he" ? "מדיניות הפרטיות" : "Privacy Policy"}
                    </Link>
                    {copy.onboardAcceptTermsSuffix}
                  </span>
                </label>

                <Button
                  type="submit"
                  className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home mt-2 !w-full !rounded-full !shadow-none hover:!opacity-100"
                  disabled={loading || !acceptTerms}
                >
                  {loading ? copy.onboardCreating : copy.onboardSubmit}
                </Button>
              </form>
            </>
          )}
        </Panel>
      </div>
    </WebShell>
  );
}
