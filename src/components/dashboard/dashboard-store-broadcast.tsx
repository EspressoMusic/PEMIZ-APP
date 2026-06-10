"use client";

import { useEffect, useState } from "react";
import { ChevronDown, History, Megaphone } from "lucide-react";
import { Alert, Button, Textarea } from "@/components/ui";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  appendBroadcastUpdate,
  mergeBroadcastHistory,
  serializeStoreBroadcastHistory,
  type StoreBroadcastEntry,
} from "@/lib/store-broadcast-history";

function toPublished(
  message: string,
  sentAt: string | null
): StoreBroadcastEntry | null {
  if (!sentAt || !message.trim()) return null;
  return { message: message.trim(), sentAt };
}

function BroadcastHistoryItem({
  item,
  expanded,
  onToggle,
  formatDayDate,
}: {
  item: StoreBroadcastEntry;
  expanded: boolean;
  onToggle: () => void;
  formatDayDate: (iso: string) => string;
}) {
  return (
    <li className="dashboard-broadcast-history-item">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="dashboard-broadcast-history-toggle relative"
      >
        <span className="block px-8">{formatDayDate(item.sentAt)}</span>
        <ChevronDown
          className={`absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-bakery-muted transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          strokeWidth={2.5}
          aria-hidden
        />
      </button>
      {expanded && (
        <div className="dashboard-broadcast-history-body">
          <div className="dashboard-broadcast-history-message">
            <p className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed text-bakery-ink">
              {item.message}
            </p>
          </div>
        </div>
      )}
    </li>
  );
}

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
        rows={6}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        placeholder={labels.broadcastPlaceholder}
        maxLength={500}
        className="dashboard-broadcast-field min-h-[168px] resize-none rounded-[12px]"
        aria-label={labels.broadcastPlaceholder}
      />
      <Button
        type="button"
        variant="primary"
        className="dashboard-broadcast-send-btn mt-3 w-full min-h-[52px] rounded-full font-extrabold"
        disabled={saving}
        onClick={onSend}
      >
        {saving ? labels.sending : labels.sendToAllCustomers}
      </Button>
    </div>
  );
}

function BroadcastHistoryPanel({
  history,
  expandedSentAt,
  onToggle,
  labels,
  formatDayDate,
}: {
  history: StoreBroadcastEntry[];
  expandedSentAt: string | null;
  onToggle: (sentAt: string) => void;
  labels: {
    broadcastHistory: string;
    broadcastHistoryEmpty: string;
  };
  formatDayDate: (iso: string) => string;
}) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3 text-start">
      <button
        type="button"
        onClick={() => {
          setPanelOpen((open) => {
            if (open && expandedSentAt) onToggle(expandedSentAt);
            return !open;
          });
        }}
        aria-expanded={panelOpen}
        className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
          panelOpen ? "bakery-float-tile--active" : ""
        }`}
      >
        <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <History className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
          {labels.broadcastHistory}
          {history.length > 0 && (
            <span className="font-semibold text-bakery-muted">
              {" "}
              ({history.length})
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
            panelOpen ? "rotate-180" : ""
          }`}
          strokeWidth={2.5}
          aria-hidden
        />
      </button>

      {panelOpen ? (
        history.length > 0 ? (
          <ul className="dashboard-broadcast-history-list mt-2 text-center">
            {history.map((item) => (
              <BroadcastHistoryItem
                key={item.sentAt}
                item={item}
                expanded={expandedSentAt === item.sentAt}
                formatDayDate={formatDayDate}
                onToggle={() => onToggle(item.sentAt)}
              />
            ))}
          </ul>
        ) : (
          <p className="dashboard-broadcast-history-empty mt-2">
            {labels.broadcastHistoryEmpty}
          </p>
        )
      ) : null}
    </div>
  );
}

export function DashboardStoreBroadcast({
  previewOnly = false,
  initialMessage = "",
  initialSentAt = null as string | null,
  initialHistory = [] as StoreBroadcastEntry[],
}: {
  previewOnly?: boolean;
  initialMessage?: string;
  initialSentAt?: string | null;
  initialHistory?: StoreBroadcastEntry[];
}) {
  const { labels, formatDayDate } = useAppLocale();
  const initialPublished = toPublished(initialMessage, initialSentAt);

  const [draft, setDraft] = useState("");
  const [history, setHistory] = useState<StoreBroadcastEntry[]>(() =>
    initialHistory.length > 0
      ? initialHistory
      : initialPublished
        ? [initialPublished]
        : []
  );
  const [expandedSentAt, setExpandedSentAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (previewOnly) return;
    fetch("/api/dashboard/store-broadcast")
      .then((r) => r.json())
      .then((d) => {
        const msg = typeof d.message === "string" ? d.message : "";
        const items = Array.isArray(d.history)
          ? (d.history as StoreBroadcastEntry[])
          : mergeBroadcastHistory(null, msg, d.sentAt ?? null);
        setHistory(items);
      });
  }, [previewOnly]);

  async function send() {
    setError("");
    const trimmed = draft.trim();
    if (!trimmed) {
      setError(labels.broadcastWriteMessage);
      return;
    }
    setSaving(true);

    if (previewOnly) {
      const nextHistory = appendBroadcastUpdate(
        serializeStoreBroadcastHistory(history),
        history[0]?.message,
        history[0]?.sentAt,
        trimmed
      );
      setHistory(nextHistory);
      setDraft("");
      setExpandedSentAt(null);
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

    const nextHistory = Array.isArray(data.history)
      ? (data.history as StoreBroadcastEntry[])
      : appendBroadcastUpdate(
          serializeStoreBroadcastHistory(history),
          history[0]?.message,
          history[0]?.sentAt,
          trimmed
        );
    setHistory(nextHistory);
    setDraft("");
    setExpandedSentAt(null);
  }

  return (
    <div className="space-y-3 pb-2 text-center">
      <BroadcastComposeSection
        draft={draft}
        saving={saving}
        error={error}
        labels={labels}
        onDraftChange={setDraft}
        onSend={() => void send()}
      />
      <BroadcastHistoryPanel
        history={history}
        expandedSentAt={expandedSentAt}
        onToggle={(sentAt) =>
          setExpandedSentAt((current) => (current === sentAt ? null : sentAt))
        }
        labels={labels}
        formatDayDate={formatDayDate}
      />
    </div>
  );
}

/** שורה בלקוחות — פותחת ישר את הודעה ללקוחות + היסטוריה למטה */
export function DashboardBroadcastEntry({
  previewOnly = false,
  initialMessage = "",
  initialSentAt = null as string | null,
  initialHistory = [] as StoreBroadcastEntry[],
}: {
  previewOnly?: boolean;
  initialMessage?: string;
  initialSentAt?: string | null;
  initialHistory?: StoreBroadcastEntry[];
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
        expanded
        warmPanel
      >
        <DashboardStoreBroadcast
          previewOnly={previewOnly}
          initialMessage={initialMessage}
          initialSentAt={initialSentAt}
          initialHistory={initialHistory}
        />
      </DashboardActionSheet>
    </>
  );
}
