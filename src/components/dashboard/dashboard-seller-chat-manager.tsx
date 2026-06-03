"use client";

import { useEffect, useState } from "react";
import { Button, PageTitle, Panel, Textarea } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import type { StoreChatMessageDto } from "@/lib/store-chat";

type Thread = {
  customerPhone: string;
  customerName: string;
  lastMessage: string;
  lastAt: string;
};

export function DashboardSellerChatManager({
  previewOnly = false,
}: {
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<StoreChatMessageDto[]>([]);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  async function loadThreads() {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/store-chat");
    const data = await res.json();
    if (res.ok) setThreads(data.threads ?? []);
  }

  async function loadMessages(phone: string) {
    if (previewOnly) return;
    const res = await fetch(
      `/api/dashboard/store-chat?phone=${encodeURIComponent(phone)}`
    );
    const data = await res.json();
    if (res.ok) setMessages(data.messages ?? []);
  }

  useEffect(() => {
    loadThreads();
  }, [previewOnly]);

  useEffect(() => {
    if (!activePhone || previewOnly) return;
    void loadMessages(activePhone);
    const id = window.setInterval(() => loadMessages(activePhone), 5000);
    return () => window.clearInterval(id);
  }, [activePhone, previewOnly]);

  async function sendReply() {
    if (!activePhone) return;
    const text = reply.trim();
    if (!text) return;
    setError("");
    const res = await fetch("/api/dashboard/store-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerPhone: activePhone, body: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? labels.networkError);
      return;
    }
    setReply("");
    loadMessages(activePhone);
    loadThreads();
  }

  return (
    <div className="space-y-4 pb-2">
      <PageTitle>{labels.sellerChatTitle}</PageTitle>
      <p className="text-center text-[14px] font-semibold text-bakery-muted">
        {labels.sellerChatHint}
      </p>
      {error && (
        <p className="text-center text-[14px] font-bold text-bakery-error">{error}</p>
      )}
      <div className="space-y-2">
        {threads.length === 0 ? (
          <Panel>
            <p className="text-center text-[15px] font-bold text-bakery-ink">
              {labels.sellerChatEmpty}
            </p>
          </Panel>
        ) : (
          threads.map((t) => (
            <button
              key={t.customerPhone}
              type="button"
              onClick={() => setActivePhone(t.customerPhone)}
              className={`block w-full rounded-[20px] border-[1.2px] px-4 py-3 text-start transition ${
                activePhone === t.customerPhone
                  ? "border-bakery-primary/50 bg-bakery-primary/10"
                  : "border-bakery-border/45 bg-bakery-square"
              }`}
            >
              <p className="text-[16px] font-extrabold text-bakery-ink">
                {t.customerName}
              </p>
              <p className="text-[13px] text-bakery-muted">{t.customerPhone}</p>
              <p className="mt-1 line-clamp-2 text-[14px] text-bakery-ink">
                {t.lastMessage}
              </p>
            </button>
          ))
        )}
      </div>
      {activePhone && (
        <Panel className="space-y-3">
          <div className="max-h-[240px] space-y-2 overflow-y-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-[14px] px-3 py-2 text-[14px] ${
                  m.authorRole === "SELLER"
                    ? "bg-bakery-primary/15 text-bakery-ink"
                    : "bg-bakery-card text-bakery-ink"
                }`}
              >
                {m.body}
              </div>
            ))}
          </div>
          <Textarea
            label={labels.replyToCustomer}
            rows={3}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <Button type="button" className="w-full" onClick={() => void sendReply()}>
            {labels.sendReply}
          </Button>
        </Panel>
      )}
    </div>
  );
}
