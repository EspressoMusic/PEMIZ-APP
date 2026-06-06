"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import {
  DashboardSettingsTile,
  DashboardSettingsTileRow,
} from "@/components/dashboard/dashboard-settings-tile";
import { DASHBOARD_SETTINGS_ACTION } from "@/components/dashboard/dashboard-settings-bar";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardDeleteStoreSection({
  businessName,
  previewOnly = false,
}: {
  businessName?: string;
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const modalBody = businessName
    ? labels.deleteStoreModalBodyNamed.replace("{name}", businessName)
    : labels.deleteStoreModalBody;

  function openConfirm() {
    setError("");
    if (previewOnly) {
      setError(labels.deleteStorePreviewOnly);
      return;
    }
    setConfirmOpen(true);
  }

  async function executeDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/business", { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? labels.deleteStoreError);
        setDeleting(false);
        return;
      }
      window.location.href = "/onboarding";
    } catch {
      setError(labels.deleteStoreError);
      setDeleting(false);
    }
  }

  return (
    <>
      <DashboardSettingsTile variant="danger">
        <DashboardSettingsTileRow
          panel={
            <p className="text-[15px] font-extrabold text-bakery-error">
              {labels.deleteStoreTitle}
            </p>
          }
          action={
            <button
              type="button"
              disabled={deleting}
              onClick={openConfirm}
              aria-label={labels.deleteStoreButton}
              className={`${DASHBOARD_SETTINGS_ACTION} w-10 border border-bakery-error/50 bg-bakery-card/70 text-bakery-error transition hover:bg-bakery-error/10 disabled:opacity-50`}
            >
              <Trash2 size={20} strokeWidth={2.1} aria-hidden />
            </button>
          }
        />
        {error && !confirmOpen && (
          <p className="px-3 pb-3 text-center text-[13px] font-semibold text-bakery-error">
            {error}
          </p>
        )}
      </DashboardSettingsTile>

      <DashboardActionSheet
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        title={labels.deleteStoreModalTitle}
        ariaLabel={labels.deleteStoreModalTitle}
      >
        <div className="space-y-4 text-center">
          <p className="text-[15px] font-semibold leading-relaxed text-bakery-ink">
            {modalBody}
          </p>
          {error && (
            <p className="text-[13px] font-semibold text-bakery-error">{error}</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:flex-1"
              disabled={deleting}
              onClick={() => setConfirmOpen(false)}
            >
              {labels.cancel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={deleting}
              className="w-full border-bakery-error/45 bg-bakery-card text-bakery-error hover:bg-bakery-error/10 sm:flex-1"
              onClick={() => void executeDelete()}
            >
              {deleting ? labels.deleting : labels.deleteStoreModalConfirm}
            </Button>
          </div>
        </div>
      </DashboardActionSheet>
    </>
  );
}
