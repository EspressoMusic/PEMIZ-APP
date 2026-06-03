"use client";

import { useEffect, useState } from "react";
import { Button, Textarea, Panel, Alert, PageTitle } from "@/components/ui";

type InquiryRow = {
  id: string;
  customerName: string;
  message: string;
  customerPhone?: string | null;
  sellerReply?: string | null;
  sellerReplyAt?: string | null;
  createdAt: string;
};

export function DashboardInquiriesManager({
  previewOnly = false,
  initialItems = [] as InquiryRow[],
}: {
  previewOnly?: boolean;
  initialItems?: InquiryRow[];
}) {
  const [items, setItems] = useState<InquiryRow[]>(
    previewOnly ? initialItems : []
  );
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/inquiries");
    const data = await res.json();
    if (res.ok) setItems(data.inquiries ?? []);
  }

  useEffect(() => {
    load();
  }, [previewOnly]);

  async function sendReply(id: string) {
    setError("");
    const text = (replyDrafts[id] ?? "").trim();
    if (!text) {
      setError("יש לכתוב תשובה");
      return;
    }

    if (previewOnly) {
      setItems((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                sellerReply: text,
                sellerReplyAt: new Date().toISOString(),
              }
            : row
        )
      );
      setReplyingId(null);
      return;
    }

    const res = await fetch(`/api/dashboard/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerReply: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "שגיאה בשליחה");
      return;
    }
    setReplyingId(null);
    load();
  }

  const pendingCount = items.filter((q) => !q.sellerReply).length;

  return (
    <div className="space-y-4 pb-2">
      <PageTitle>פניות לקוחות</PageTitle>
      <p className="text-center text-[14px] text-bakery-muted">
        {pendingCount > 0
          ? `${pendingCount} פניות ממתינות לתשובה`
          : "כל הפניות נענו"}
      </p>

      {error && <Alert variant="error">{error}</Alert>}

      {items.map((q) => {
        const isReplying = replyingId === q.id;
        return (
          <Panel key={q.id} className="space-y-3">
            <div>
              <p className="text-[17px] font-extrabold">{q.customerName}</p>
              {q.customerPhone && (
                <p className="text-[14px]" dir="ltr">
                  {q.customerPhone}
                </p>
              )}
              <p className="mt-1 text-[12px] text-bakery-muted">
                {new Date(q.createdAt).toLocaleString("he-IL")}
              </p>
            </div>
            <div className="rounded-[16px] bg-bakery-card/80 px-3 py-2.5">
              <p className="text-[12px] font-bold text-bakery-muted">פניית הלקוח</p>
              <p className="mt-1 whitespace-pre-wrap text-[15px] text-bakery-ink">
                {q.message}
              </p>
            </div>

            {q.sellerReply && !isReplying && (
              <div className="rounded-[16px] border border-bakery-primary/20 bg-bakery-primary/8 px-3 py-2.5">
                <p className="text-[12px] font-bold text-bakery-primary">התשובה שלך</p>
                <p className="mt-1 whitespace-pre-wrap text-[15px] text-bakery-ink">
                  {q.sellerReply}
                </p>
                {q.sellerReplyAt && (
                  <p className="mt-1 text-[11px] text-bakery-muted">
                    {new Date(q.sellerReplyAt).toLocaleString("he-IL")}
                  </p>
                )}
              </div>
            )}

            {isReplying ? (
              <div className="space-y-2">
                <Textarea
                  label="תשובה ללקוח"
                  rows={3}
                  value={replyDrafts[q.id] ?? q.sellerReply ?? ""}
                  onChange={(e) =>
                    setReplyDrafts((d) => ({ ...d, [q.id]: e.target.value }))
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="square"
                    onClick={() => sendReply(q.id)}
                  >
                    שלח תשובה
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setReplyingId(null)}
                  >
                    ביטול
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant={q.sellerReply ? "ghost" : "square"}
                onClick={() => {
                  setReplyingId(q.id);
                  setReplyDrafts((d) => ({
                    ...d,
                    [q.id]: d[q.id] ?? q.sellerReply ?? "",
                  }));
                }}
              >
                {q.sellerReply ? "ערוך תשובה" : "ענה ללקוח"}
              </Button>
            )}
          </Panel>
        );
      })}

      {items.length === 0 && (
        <p className="text-center text-bakery-muted">אין פניות מלקוחות עדיין.</p>
      )}
    </div>
  );
}
