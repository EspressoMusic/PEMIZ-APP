"use client";

import { useEffect, useState } from "react";
import { Button, Textarea, Alert, PageTitle, Panel } from "@/components/ui";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardStoreBroadcast({
  previewOnly = false,
  initialMessage = "",
  initialSentAt = null as string | null,
}: {
  previewOnly?: boolean;
  initialMessage?: string;
  initialSentAt?: string | null;
}) {
  const { labels, formatDateTime } = useAppLocale();
  const [message, setMessage] = useState(initialMessage);
  const [sentAt, setSentAt] = useState<string | null>(initialSentAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (previewOnly) return;
    fetch("/api/dashboard/store-broadcast")
      .then((r) => r.json())
      .then((d) => {
        if (d.message != null) setMessage(d.message);
        setSentAt(d.sentAt ?? null);
      });
  }, [previewOnly]);

  async function send() {
    setError("");
    setSuccess("");
    const trimmed = message.trim();
    if (!trimmed) {
      setError(labels.broadcastWriteMessage);
      return;
    }
    setSaving(true);

    if (previewOnly) {
      setSentAt(new Date().toISOString());
      setSuccess(labels.broadcastSentPreview);
      setSaving(false);
      return;
    }

    const res = await fetch("/api/dashboard/store-broadcast", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? labels.networkError);
      return;
    }
    setSentAt(data.sentAt ?? new Date().toISOString());
    setSuccess(labels.broadcastPublished);
  }

  return (
    <div className="space-y-4 pb-2">
      <PageTitle>{labels.customerMessage}</PageTitle>
      <DashboardHelpText>
        <p className="text-center text-[14px] text-bakery-muted">
          {labels.broadcastPublished}
        </p>
      </DashboardHelpText>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="bakery-float-panel rounded-[24px] p-4">
        <Textarea
          label={labels.broadcastMessage}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={labels.broadcastPlaceholder}
          maxLength={500}
        />
        <Button
          type="button"
          variant="square"
          className="mt-3 w-full"
          disabled={saving}
          onClick={send}
        >
          {saving ? labels.sending : labels.sendToAllCustomers}
        </Button>
      </div>

      {sentAt && (
        <Panel className="bakery-sent-message-preview">
          <p className="bakery-sent-message-preview__muted text-[14px] font-bold">
            {labels.broadcastPublished}
          </p>
          <p className="bakery-sent-message-preview__muted mt-1 text-[13px]">
            {formatDateTime(sentAt)}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">
            {message}
          </p>
        </Panel>
      )}
    </div>
  );
}
