"use client";

import { useEffect, useState } from "react";
import { ChevronDown, History, Megaphone, X } from "lucide-react";
import { Alert, Button, Textarea } from "@/components/ui";
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

function BroadcastComposeModal({
  draft,
  saving,
  error,
  labels,
  onDraftChange,
  onClose,
  onSend,
}: {
  draft: string;
  saving: boolean;
  error: string;
  labels: {
    customerMessage: string;
    broadcastMessage: string;
    broadcastPlaceholder: string;
    sendToAllCustomers: string;
    sending: string;
    close: string;
  };
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={labels.customerMessage}
    >
      <button
        type="button"
        className="dashboard-modal-backdrop absolute inset-0"
        onClick={onClose}
        aria-label={labels.close}
      />
      <div className="relative w-full max-w-md">
        <div className="dashboard-broadcast-form">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-2 top-2 z-10 rounded-full p-2 text-bakery-muted transition hover:bg-bakery-card/80 hover:text-bakery-ink"
            aria-label={labels.close}
          >
            <X className="h-6 w-6" strokeWidth={2.25} />
          </button>

          <div className="pt-8">
            {error && (
              <div className="mb-3">
                <Alert variant="error">{error}</Alert>
              </div>
            )}
            <Textarea
              label={labels.broadcastMessage}
              labelClassName="block w-full text-center text-[15px] font-extrabold"
              rows={5}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder={labels.broadcastPlaceholder}
              maxLength={500}
              className="dashboard-broadcast-field min-h-[140px] resize-y"
            />
            <Button
              type="button"
              variant="primary"
              className="mt-3 w-full min-h-[52px] rounded-full font-extrabold"
              disabled={saving}
              onClick={onSend}
            >
              {saving ? labels.sending : labels.sendToAllCustomers}
            </Button>
          </div>
        </div>
      </div>
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

  const [draft, setDraft] = useState(initialMessage);
  const [history, setHistory] = useState<StoreBroadcastEntry[]>(() =>
    initialHistory.length > 0
      ? initialHistory
      : initialPublished
        ? [initialPublished]
        : []
  );
  const [expandedSentAt, setExpandedSentAt] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
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
        setDraft(msg);
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
      setDraft(trimmed);
      setExpandedSentAt(null);
      setSaving(false);
      setComposeOpen(false);
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
    setDraft(typeof data.message === "string" ? data.message : trimmed);
    setExpandedSentAt(null);
    setComposeOpen(false);
  }

  function closeCompose() {
    setComposeOpen(false);
    setError("");
  }

  return (
    <div className="space-y-4 pb-2 text-center">
      <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={composeOpen}
          className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
            composeOpen ? "bakery-float-tile--active" : ""
          }`}
        >
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <Megaphone className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
            {labels.customerMessage}
          </span>
        </button>

        <div className="mt-2 border-t border-bakery-border/25 pt-2">
          <button
            type="button"
            onClick={() => setHistoryOpen((value) => !value)}
            aria-expanded={historyOpen}
            className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
              historyOpen ? "bakery-float-tile--active" : ""
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
                historyOpen ? "rotate-180" : ""
              }`}
              strokeWidth={2.5}
              aria-hidden
            />
          </button>

          {historyOpen && (
            <div className="mt-2 text-center">
              {history.length > 0 ? (
                <ul className="dashboard-broadcast-history-list">
                  {history.map((item) => (
                    <BroadcastHistoryItem
                      key={item.sentAt}
                      item={item}
                      expanded={expandedSentAt === item.sentAt}
                      formatDayDate={formatDayDate}
                      onToggle={() =>
                        setExpandedSentAt((current) =>
                          current === item.sentAt ? null : item.sentAt
                        )
                      }
                    />
                  ))}
                </ul>
              ) : (
                <p className="dashboard-broadcast-history-empty">
                  {labels.broadcastHistoryEmpty}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {composeOpen && (
        <BroadcastComposeModal
          draft={draft}
          saving={saving}
          error={error}
          labels={labels}
          onDraftChange={setDraft}
          onClose={closeCompose}
          onSend={() => void send()}
        />
      )}
    </div>
  );
}
