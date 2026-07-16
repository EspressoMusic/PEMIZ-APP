"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Alert, Toggle } from "@/components/ui";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { DASHBOARD_ACTION_ROW_CLASS } from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardOrderConfirmationSettings({
  initialRequired = true,
  previewOnly = false,
  embedded = false,
}: {
  initialRequired?: boolean;
  previewOnly?: boolean;
  /** Inside a shared settings card — no outer card wrapper of its own. */
  embedded?: boolean;
}) {
  const { labels } = useAppLocale();
  const [required, setRequired] = useState(initialRequired);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function persist(next: boolean) {
    const previous = required;
    setRequired(next);
    setError("");
    setMessage("");

    if (previewOnly) {
      setMessage(labels.previewSavedHint);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/order-confirmation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ required: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? labels.saveError);
        setRequired(previous);
        return;
      }
      setMessage(labels.saved);
      setTimeout(() => setMessage(""), 2500);
    } catch {
      setError(labels.networkError);
      setRequired(previous);
    } finally {
      setSaving(false);
    }
  }

  function handleToggle(next: boolean) {
    if (next) {
      setConfirmOpen(true);
      return;
    }
    void persist(false);
  }

  function confirmEnable() {
    setConfirmOpen(false);
    void persist(true);
  }

  const row = (
    <div
      className={`${DASHBOARD_ACTION_ROW_CLASS} justify-between ${
        saving ? "opacity-45" : ""
      }`}
    >
      <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
        <Check className="h-6 w-6" strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
        {labels.orderConfirmationTitle}
      </span>
      <Toggle
        enabled={required}
        onChange={handleToggle}
        disabled={saving}
        ariaLabel={labels.orderConfirmationTitle}
      />
    </div>
  );

  const confirmSheet = (
    <DashboardActionSheet
      open={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      title={labels.orderConfirmationEnableConfirmTitle}
      ariaLabel={labels.orderConfirmationEnableConfirmTitle}
      placement="center"
      expanded={false}
      fitContent
      panelClassName="w-full max-w-md"
    >
      <div className="space-y-6 px-2 py-2 text-center">
        <h2 className="text-[17px] font-extrabold text-bakery-ink">
          {labels.orderConfirmationEnableConfirmTitle}
        </h2>
        <p className="text-[15px] font-semibold leading-relaxed text-bakery-ink">
          {labels.orderConfirmationEnableConfirmBody}
        </p>
        <div className="flex flex-row items-stretch justify-center gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="min-h-[48px] min-w-[7.5rem] rounded-xl border-2 border-bakery-border bg-bakery-card px-4 text-[15px] font-extrabold text-bakery-ink transition hover:bg-bakery-surface active:opacity-80"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            onClick={confirmEnable}
            className="min-h-[48px] min-w-[7.5rem] rounded-xl border-2 border-bakery-primary bg-bakery-primary px-4 text-[15px] font-extrabold text-bakery-on-primary transition hover:opacity-95 active:opacity-80"
          >
            {labels.confirm}
          </button>
        </div>
      </div>
    </DashboardActionSheet>
  );

  if (embedded) {
    return (
      <>
        <li>{row}</li>
        <li>
          <DashboardHelpText>
            <p className="text-center text-[13px] font-semibold text-bakery-muted">
              {labels.orderConfirmationHint}
            </p>
          </DashboardHelpText>
        </li>
        {error ? (
          <li>
            <Alert variant="error">{error}</Alert>
          </li>
        ) : null}
        {message ? (
          <li>
            <Alert variant="success">{message}</Alert>
          </li>
        ) : null}
        {confirmSheet}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="dashboard-card bakery-float-panel rounded-[32px] p-3">
        <div className="mx-auto flex w-full max-w-[400px] flex-col items-center gap-3">
          {row}
          <DashboardHelpText>
            <p className="text-center text-[13px] font-semibold text-bakery-muted">
              {labels.orderConfirmationHint}
            </p>
          </DashboardHelpText>
          {error ? <Alert variant="error">{error}</Alert> : null}
          {message ? <Alert variant="success">{message}</Alert> : null}
        </div>
      </div>
      {confirmSheet}
    </div>
  );
}
