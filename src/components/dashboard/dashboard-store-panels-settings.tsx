"use client";

import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { Alert, Toggle } from "@/components/ui";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  DEFAULT_STORE_PANELS_VISIBLE,
  type StorePanelsVisible,
} from "@/lib/store-panels-visible";

function PanelToggleRow({
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

export function DashboardStorePanelsSettings({
  initial = DEFAULT_STORE_PANELS_VISIBLE,
  previewOnly = false,
  businessType = "STORE",
}: {
  initial?: StorePanelsVisible;
  previewOnly?: boolean;
  businessType?: string;
}) {
  const { labels } = useAppLocale();
  const [panels, setPanels] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isStore = businessType === "STORE";

  async function patch(patch: Partial<StorePanelsVisible>) {
    const next = { ...panels, ...patch };
    setPanels(next);
    if (previewOnly) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/store-panels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPanels(panels);
        setError(
          (data as { error?: string }).error ?? labels.storePanelsSaveFailed
        );
        return;
      }
      if (data.panels) setPanels(data.panels as StorePanelsVisible);
    } catch {
      setPanels(panels);
      setError(labels.storePanelsSaveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-settings-style-rows space-y-2">
      {error ? <Alert variant="error">{error}</Alert> : null}
      {isStore ? (
        <PanelToggleRow
          label={labels.storePanelDeals}
          enabled={panels.deals}
          disabled={saving}
          onChange={(deals) => void patch({ deals })}
        />
      ) : null}
      <PanelToggleRow
        label={labels.storePanelBroadcast}
        enabled={panels.broadcast}
        disabled={saving}
        onChange={(broadcast) => void patch({ broadcast })}
      />
      <PanelToggleRow
        label={labels.storePanelChat}
        enabled={panels.chat}
        disabled={saving}
        onChange={(chat) => void patch({ chat })}
      />
      <PanelToggleRow
        label={labels.storePanelInquiries}
        enabled={panels.inquiries}
        disabled={saving}
        onChange={(inquiries) => void patch({ inquiries })}
      />
      <PanelToggleRow
        label={labels.storePanelFaq}
        enabled={panels.faq}
        disabled={saving}
        onChange={(faq) => void patch({ faq })}
      />
      <PanelToggleRow
        label={labels.storePanelReviews}
        enabled={panels.reviews}
        disabled={saving}
        onChange={(reviews) => void patch({ reviews })}
      />
      <PanelToggleRow
        label={labels.storePanelOrderLimits}
        enabled={panels.orderLimits}
        disabled={saving}
        onChange={(orderLimits) => void patch({ orderLimits })}
      />
      <PanelToggleRow
        label={labels.storePanelCoupons}
        enabled={panels.coupons}
        disabled={saving}
        onChange={(coupons) => void patch({ coupons })}
      />
      {isStore ? (
        <PanelToggleRow
          label={labels.storePanelCustomerAddress}
          enabled={panels.customerAddress}
          disabled={saving}
          onChange={(customerAddress) => void patch({ customerAddress })}
        />
      ) : null}
      <PanelToggleRow
        label={labels.storePanelSettings}
        enabled={panels.settings}
        disabled={saving}
        onChange={(settings) => void patch({ settings })}
      />
    </div>
  );
}

export function DashboardStorePanelsSettingsGroup({
  initial = DEFAULT_STORE_PANELS_VISIBLE,
  previewOnly = false,
  businessType = "STORE",
}: {
  initial?: StorePanelsVisible;
  previewOnly?: boolean;
  businessType?: string;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <>
      <DashboardActionRowButton
        onClick={() => setOpen(true)}
        icon={LayoutGrid}
        title={labels.storePanelsTitle}
      />
      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.storePanelsTitle}
        ariaLabel={labels.storePanelsTitle}
        placement="top"
        showBackButton
      >
        <DashboardStorePanelsSettings
          initial={initial}
          previewOnly={previewOnly}
          businessType={businessType}
        />
      </DashboardActionSheet>
    </>
  );
}
