"use client";

import { useState } from "react";
import { Alert, Toggle } from "@/components/ui";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  DEFAULT_SELLER_ALERTS,
  type SellerAlertsSettings,
} from "@/lib/seller-alerts";
import { DashboardSellerPushRegistration } from "@/components/dashboard/dashboard-seller-push-registration";

function AlertToggleRow({
  label,
  enabled,
  onChange,
  disabled = false,
}: {
  label: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`dashboard-action-square flex w-full items-center justify-between gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
        disabled ? "opacity-45" : ""
      }`}
    >
      <span className="min-w-0 flex-1 text-[15px] font-extrabold leading-snug text-bakery-ink">
        {label}
      </span>
      <Toggle
        enabled={enabled}
        onChange={onChange}
        disabled={disabled}
        ariaLabel={label}
      />
    </div>
  );
}

export function DashboardSellerAlertsSettings({
  initial = DEFAULT_SELLER_ALERTS,
  previewOnly = false,
  businessType = "STORE",
}: {
  initial?: SellerAlertsSettings;
  previewOnly?: boolean;
  businessType?: "STORE" | "APPOINTMENTS" | "RENTAL";
}) {
  const { labels } = useAppLocale();
  const isAppointments = businessType === "APPOINTMENTS" || businessType === "RENTAL";
  const newBookingAlertLabel = isAppointments
    ? labels.alertOnNewAppointment
    : labels.alertOnNewOrder;
  const capacityAlertLabel = isAppointments
    ? labels.alertOnAllSlotsFull
    : labels.alertOnLowStock;
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function persist(next: SellerAlertsSettings) {
    const previous = settings;
    setSettings(next);
    setError("");
    setMessage("");

    if (previewOnly) {
      setMessage(labels.previewSavedHint);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/seller-alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? labels.saveError);
        setSettings(previous);
        return;
      }
      setMessage(labels.saved);
      setTimeout(() => setMessage(""), 2500);
    } catch {
      setError(labels.networkError);
      setSettings(previous);
    } finally {
      setSaving(false);
    }
  }

  function patch(partial: Partial<SellerAlertsSettings>) {
    void persist({ ...settings, ...partial });
  }

  const optionsDisabled = !settings.enabled || saving;

  return (
    <div className="space-y-4">
      <div className="dashboard-card bakery-float-panel rounded-[32px] p-3">
        <div className="mx-auto flex w-full max-w-[400px] flex-col items-center gap-3">
          <AlertToggleRow
            label={labels.alertsEnableTitle}
            enabled={settings.enabled}
            disabled={saving}
            onChange={(enabled) => patch({ enabled })}
          />

          <DashboardHelpText>
            <p className="text-center text-[13px] font-semibold text-bakery-muted">
              {labels.alertsEnableHint}
            </p>
          </DashboardHelpText>

          <div className="w-full space-y-2 border-t border-bakery-border/25 pt-3">
            <AlertToggleRow
              label={labels.alertOnCustomerInquiry}
              enabled={settings.onInquiry}
              disabled={optionsDisabled}
              onChange={(onInquiry) => patch({ onInquiry })}
            />
            <AlertToggleRow
              label={labels.alertOnChatMessage}
              enabled={settings.onChat}
              disabled={optionsDisabled}
              onChange={(onChat) => patch({ onChat })}
            />
            <AlertToggleRow
              label={newBookingAlertLabel}
              enabled={settings.onNewOrder}
              disabled={optionsDisabled}
              onChange={(onNewOrder) => patch({ onNewOrder })}
            />
            <AlertToggleRow
              label={capacityAlertLabel}
              enabled={settings.onLowStock}
              disabled={optionsDisabled}
              onChange={(onLowStock) => patch({ onLowStock })}
            />
          </div>

          {settings.enabled ? (
            <DashboardSellerPushRegistration
              alertsEnabled={settings.enabled}
              previewOnly={previewOnly}
            />
          ) : (
            <Alert variant="info">{labels.pushAlertsMustEnable}</Alert>
          )}

          {error ? <Alert variant="error">{error}</Alert> : null}
          {message ? <Alert variant="success">{message}</Alert> : null}
          {saving ? (
            <p className="text-center text-[13px] font-semibold text-bakery-muted">
              {labels.chatLoading}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
