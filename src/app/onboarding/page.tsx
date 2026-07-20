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
    <div className="w-full rounded-2xl border-2 border-bakery-border bg-bakery-card px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 flex-1 text-[14px] font-bold text-bakery-ink">{label}</span>
        <Toggle enabled={enabled} onChange={onChange} ariaLabel={label} variant="auth" />
      </div>
      <span className="mt-1 block text-[12px] font-medium leading-snug text-bakery-muted">
        {hint}
      </span>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { copy, locale } = useMarketingLocale();
  const [type, setType] = useState<"STORE" | "APPOINTMENTS">("STORE");
  const [reviews, setReviews] = useState(false);
  const [coupons, setCoupons] = useState(false);
  const [deals, setDeals] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [orderConfirmationRequired, setOrderConfirmationRequired] = useState(true);
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
        ...(type === "STORE"
          ? { reviews, coupons, deals, chat: whatsapp, orderConfirmationRequired }
          : {}),
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
                  className={`auth-option-btn px-3 py-3 text-[14px] font-bold ${
                    type === "STORE" ? "auth-option-btn--selected" : ""
                  }`}
                >
                  {copy.onboardProductStore}
                </button>
                <button
                  type="button"
                  onClick={() => setType("APPOINTMENTS")}
                  className={`auth-option-btn px-3 py-3 text-[14px] font-bold ${
                    type === "APPOINTMENTS" ? "auth-option-btn--selected" : ""
                  }`}
                >
                  {copy.onboardAppointments}
                </button>
              </div>
            </div>

            {type === "STORE" ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[14px] font-bold text-bakery-ink">
                    {copy.onboardFeaturesTitle}
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <OnboardFeatureToggleRow
                      label={copy.onboardFeatureReviews}
                      hint={copy.onboardFeatureReviewsHint}
                      enabled={reviews}
                      onChange={setReviews}
                    />
                    <OnboardFeatureToggleRow
                      label={copy.onboardFeatureDeals}
                      hint={copy.onboardFeatureDealsHint}
                      enabled={deals}
                      onChange={setDeals}
                    />
                    <OnboardFeatureToggleRow
                      label={copy.onboardFeatureCoupons}
                      hint={copy.onboardFeatureCouponsHint}
                      enabled={coupons}
                      onChange={setCoupons}
                    />
                    <OnboardFeatureToggleRow
                      label={copy.onboardFeatureWhatsapp}
                      hint={copy.onboardFeatureWhatsappHint}
                      enabled={whatsapp}
                      onChange={setWhatsapp}
                    />
                  </div>
                </div>

                <div>
                  <OnboardFeatureToggleRow
                    label={copy.onboardFeatureOrderConfirmation}
                    hint={copy.onboardFeatureOrderConfirmationHint}
                    enabled={orderConfirmationRequired}
                    onChange={setOrderConfirmationRequired}
                  />
                </div>
              </div>
            ) : null}

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
        </Panel>
      </div>
    </WebShell>
  );
}
