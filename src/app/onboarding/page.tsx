"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Alert, Panel, PageTitle, Toggle } from "@/components/ui";
import { WebShell } from "@/components/web-shell";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";

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
    <div className="w-full rounded-2xl border-2 border-bakery-border bg-[var(--bakery-cream-mid)] px-[clamp(0.75rem,2.6vw,1.75rem)] py-[clamp(0.375rem,2.4dvh,1.75rem)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="block text-[clamp(16px,2.4dvh,20px)] font-bold text-bakery-ink">{label}</span>
          <span className="mt-1 block text-[clamp(13px,1.8dvh,17px)] font-medium leading-snug text-bakery-muted">
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
      <div className="auth-surface mx-auto flex w-full min-h-0 max-w-2xl flex-1 flex-col justify-center px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-4">
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mb-2 self-start text-[17px] font-bold text-bakery-ink hover:underline"
          >
            ← {copy.onboardBack}
          </button>
        )}
        <Panel className="dashboard-card flex min-h-0 flex-col overflow-y-auto sm:p-8">
          {step === 1 ? (
            <>
              <PageTitle>{copy.onboardStepChooseTitle}</PageTitle>
              <div className="flex flex-1 flex-col">
                <div className="flex flex-1 flex-col justify-center gap-[clamp(0.25rem,3.2dvh,2.5rem)]">
                <div className="text-center">
                  <span className="text-[clamp(17px,2.6dvh,22px)] font-bold text-bakery-ink">
                    {copy.onboardStoreType}
                  </span>
                  <div className="mt-[clamp(0.25rem,1.8dvh,1.25rem)] grid grid-cols-2 gap-[clamp(0.5rem,1.6dvw,0.75rem)]">
                    <button
                      type="button"
                      onClick={() => setType("STORE")}
                      className={`onboard-3d-option flex flex-col items-center gap-1 rounded-2xl px-[clamp(0.75rem,2.6vw,1.75rem)] py-[clamp(0.375rem,2.8dvh,2.25rem)] text-center ${
                        type === "STORE" ? "bakery-cta-3d--primary" : "bakery-cta-3d--secondary"
                      }`}
                    >
                      <span className="text-[clamp(16px,2.6dvh,22px)] font-bold">
                        {copy.onboardProductStore}
                      </span>
                      <span
                        className={`text-[clamp(12.5px,1.7dvh,17px)] font-medium leading-tight ${
                          type === "STORE" ? "opacity-90" : "text-bakery-muted"
                        }`}
                      >
                        {copy.onboardProductStoreHint}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("APPOINTMENTS")}
                      className={`onboard-3d-option flex flex-col items-center gap-1 rounded-2xl px-[clamp(0.75rem,2.6vw,1.75rem)] py-[clamp(0.375rem,2.8dvh,2.25rem)] text-center ${
                        type === "APPOINTMENTS"
                          ? "bakery-cta-3d--primary"
                          : "bakery-cta-3d--secondary"
                      }`}
                    >
                      <span className="text-[clamp(16px,2.6dvh,22px)] font-bold">
                        {copy.onboardAppointments}
                      </span>
                      <span
                        className={`text-[clamp(12.5px,1.7dvh,17px)] font-medium leading-tight ${
                          type === "APPOINTMENTS" ? "opacity-90" : "text-bakery-muted"
                        }`}
                      >
                        {copy.onboardAppointmentsHint}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[clamp(17px,2.6dvh,22px)] font-bold text-bakery-ink">
                    {copy.onboardModeTitle}
                  </span>
                  <div className="mt-[clamp(0.25rem,1.8dvh,1.25rem)] grid grid-cols-2 gap-[clamp(0.5rem,1.6dvw,0.75rem)]">
                    <button
                      type="button"
                      onClick={() => setSimpleMode(true)}
                      className={`onboard-3d-option flex flex-col items-center gap-1 rounded-2xl px-[clamp(0.75rem,2.6vw,1.75rem)] py-[clamp(0.375rem,2.8dvh,2.25rem)] text-center ${
                        simpleMode ? "bakery-cta-3d--primary" : "bakery-cta-3d--secondary"
                      }`}
                    >
                      <span className="text-[clamp(16px,2.6dvh,22px)] font-bold">
                        {copy.onboardModeSimple}
                      </span>
                      <span
                        className={`text-[clamp(12.5px,1.7dvh,17px)] font-medium leading-tight ${
                          simpleMode ? "opacity-90" : "text-bakery-muted"
                        }`}
                      >
                        {copy.onboardModeSimpleShortHint}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimpleMode(false)}
                      className={`onboard-3d-option flex flex-col items-center gap-1 rounded-2xl px-[clamp(0.75rem,2.6vw,1.75rem)] py-[clamp(0.375rem,2.8dvh,2.25rem)] text-center ${
                        !simpleMode ? "bakery-cta-3d--primary" : "bakery-cta-3d--secondary"
                      }`}
                    >
                      <span className="text-[clamp(16px,2.6dvh,22px)] font-bold">
                        {copy.onboardModeAdvanced}
                      </span>
                      <span
                        className={`text-[clamp(12.5px,1.7dvh,17px)] font-medium leading-tight ${
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
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home mt-[clamp(0.25rem,3dvh,2rem)] !w-full !rounded-full !py-[clamp(0.5rem,3.2dvh,2.25rem)] !text-[clamp(16px,2.4dvh,20px)] !shadow-none hover:!opacity-100"
                >
                  {copy.onboardContinue}
                </Button>
              </div>
            </>
          ) : (
            <>
              <PageTitle>{copy.onboardTitle}</PageTitle>
              {error && (
                <div className="mb-4">
                  <Alert variant="error">{error}</Alert>
                </div>
              )}
              <form onSubmit={onSubmit} className="flex flex-1 flex-col">
                <div className="flex flex-1 flex-col justify-center gap-6">
                  <Input
                    name="name"
                    label={copy.onboardBusinessName}
                    labelClassName="!text-[20px]"
                    className="!py-4 !text-[20px]"
                    required
                  />
                  <Textarea
                    name="description"
                    label={copy.onboardDescription}
                    labelClassName="!text-[20px]"
                    className="!py-4 !text-[20px]"
                    rows={5}
                  />
                </div>

                <div className="space-y-4 pt-3">
                  <label className="flex items-start gap-2.5 text-[17px] leading-snug text-bakery-muted">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      aria-label={copy.onboardAcceptTermsAria}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-bakery-ink"
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
                    className="bakery-cta-3d bakery-cta-3d--primary bakery-cta-3d--home !w-full !rounded-full !py-4 !text-[20px] !shadow-none hover:!opacity-100"
                    disabled={loading || !acceptTerms}
                  >
                    {loading ? copy.onboardCreating : copy.onboardSubmit}
                  </Button>
                </div>
              </form>
            </>
          )}
        </Panel>
      </div>
    </WebShell>
  );
}
