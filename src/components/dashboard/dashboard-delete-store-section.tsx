"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
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
  embedded = false,
}: {
  businessName?: string;
  previewOnly?: boolean;
  /** Inside the shared settings panel — same row style as logout / subscription. */
  embedded?: boolean;
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
    setConfirmOpen(true);
  }

  async function executeDelete() {
    if (previewOnly) {
      setConfirmOpen(false);
      setError(labels.deleteStorePreviewOnly);
      return;
    }
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
      {embedded ? (
        <>
          <DashboardActionRowButton
            onClick={openConfirm}
            icon={Trash2}
            title={labels.deleteStoreTitle}
            danger
            disabled={deleting}
          />
          {error && !confirmOpen ? (
            <li>
              <Alert variant="error">{error}</Alert>
            </li>
          ) : null}
        </>
      ) : (
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
      )}

      <DashboardActionSheet
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        title={labels.deleteStoreModalTitle}
        ariaLabel={labels.deleteStoreModalTitle}
        placement="center"
        expanded={false}
        fitContent
        panelClassName="w-full max-w-md"
      >
        <div className="space-y-6 px-2 py-2 text-center">
          <p className="text-[15px] font-semibold leading-relaxed text-bakery-ink">
            {modalBody}
          </p>
          {error && (
            <p className="text-[13px] font-semibold text-bakery-error">{error}</p>
          )}
          <div className="flex flex-row items-stretch justify-center gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setConfirmOpen(false)}
              className="min-h-[48px] min-w-[7.5rem] rounded-xl border-2 border-bakery-border bg-bakery-card px-4 text-[15px] font-extrabold text-bakery-ink transition hover:bg-bakery-surface active:opacity-80 disabled:opacity-50"
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void executeDelete()}
              className="min-h-[48px] min-w-[7.5rem] rounded-xl border-2 border-bakery-error/45 bg-bakery-card px-4 text-[15px] font-extrabold text-bakery-error transition hover:bg-bakery-error/10 active:opacity-80 disabled:opacity-50"
            >
              {deleting ? labels.deleting : labels.deleteStoreModalConfirm}
            </button>
          </div>
        </div>
      </DashboardActionSheet>
    </>
  );
}
