"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { Alert, Button, Textarea } from "@/components/ui";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

function BroadcastComposeSection({
  draft,
  saving,
  error,
  labels,
  onDraftChange,
  onSend,
}: {
  draft: string;
  saving: boolean;
  error: string;
  labels: {
    broadcastPlaceholder: string;
    sendToAllCustomers: string;
    sending: string;
  };
  onDraftChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="dashboard-broadcast-compose space-y-3 text-start">
      {error ? (
        <div>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}
      <Textarea
        rows={5}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        placeholder={labels.broadcastPlaceholder}
        maxLength={500}
        className="dashboard-broadcast-field min-h-[140px] resize-none rounded-[12px]"
        aria-label={labels.broadcastPlaceholder}
      />
      <Button
        type="button"
        variant="primary"
        className="dashboard-broadcast-send-btn mt-1 w-full min-h-[52px] rounded-full font-extrabold"
        disabled={saving}
        onClick={onSend}
      >
        {saving ? labels.sending : labels.sendToAllCustomers}
      </Button>
    </div>
  );
}

export function DashboardStoreBroadcast({
  previewOnly = false,
}: {
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    setError("");
    const trimmed = draft.trim();
    if (!trimmed) {
      setError(labels.broadcastWriteMessage);
      return;
    }
    setSaving(true);

    if (previewOnly) {
      setDraft("");
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

    setDraft("");
  }

  return (
    <BroadcastComposeSection
      draft={draft}
      saving={saving}
      error={error}
      labels={labels}
      onDraftChange={setDraft}
      onSend={() => void send()}
    />
  );
}

/** שורה בלקוחות — פותחת חלון הודעה ללקוחות במרכז המסך */
export function DashboardBroadcastEntry({
  previewOnly = false,
}: {
  previewOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <>
      <DashboardActionRowButton
        onClick={() => setOpen(true)}
        icon={Megaphone}
        title={labels.customerMessage}
      />
      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.customerMessage}
        ariaLabel={labels.customerMessage}
        placement="center"
        showBackButton
        compact
        fitContent
        expanded={false}
        warmPanel
      >
        <DashboardStoreBroadcast previewOnly={previewOnly} />
      </DashboardActionSheet>
    </>
  );
}
