"use client";

import { useEffect, useState } from "react";
import { Button, Textarea, Alert } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardStoreExtras({
  initialDescription = "",
  previewOnly = false,
}: {
  initialDescription?: string | null;
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const [description, setDescription] = useState(initialDescription ?? "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (previewOnly) return;
    fetch("/api/business")
      .then((r) => r.json())
      .then((d) => {
        if (d.business?.description != null) {
          setDescription(d.business.description ?? "");
        }
      })
      .catch(() => {});
  }, [previewOnly]);

  async function save() {
    setError("");
    setMessage("");
    setSaving(true);

    if (previewOnly) {
      setSaving(false);
      setMessage(labels.saved);
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    const res = await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: description.trim() || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? labels.saveError);
      return;
    }
    setDescription(data.business?.description ?? "");
    setMessage(labels.saved);
    setTimeout(() => setMessage(""), 2000);
  }

  return (
    <div className="space-y-5 pb-2">
      {error && <Alert variant="error">{error}</Alert>}
      {message && (
        <p className="text-center text-[14px] font-semibold text-bakery-success">
          {message}
        </p>
      )}

      <div className="bakery-float-panel rounded-[24px] p-4 space-y-4">
        <p className="text-center text-[14px] font-semibold text-bakery-muted">
          {labels.storeDescription}
        </p>
        <div className="mx-auto flex w-full max-w-[360px] flex-col gap-3">
          <Textarea
            label={labels.storeDescription}
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={labels.storeDescriptionPlaceholder}
          />
          <Button
            type="button"
            variant="square"
            className="w-full"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? labels.saving : labels.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
