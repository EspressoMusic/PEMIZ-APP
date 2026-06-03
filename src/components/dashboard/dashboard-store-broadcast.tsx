"use client";

import { useEffect, useState } from "react";
import { Button, Textarea, Alert, PageTitle, Panel } from "@/components/ui";

export function DashboardStoreBroadcast({
  previewOnly = false,
  initialMessage = "",
  initialSentAt = null as string | null,
}: {
  previewOnly?: boolean;
  initialMessage?: string;
  initialSentAt?: string | null;
}) {
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
      setError("יש לכתוב הודעה");
      return;
    }
    setSaving(true);

    if (previewOnly) {
      setSentAt(new Date().toISOString());
      setSuccess("ההודעה נשלחה (תצוגה) — הלקוחות יראו התראה");
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
      setError(data.error ?? "שגיאה בשליחה");
      return;
    }
    setSentAt(data.sentAt ?? new Date().toISOString());
    setSuccess("ההודעה פורסמה — כל הלקוחות יקבלו התראה בכניסה לחנות");
  }

  return (
    <div className="space-y-4 pb-2">
      <PageTitle>הודעה ללקוחות</PageTitle>
      <p className="text-center text-[14px] text-bakery-muted">
        ההודעה תופיע ללקוחות כהתראה מהמוכר בכניסה לעמוד החנות
      </p>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="bakery-float-panel rounded-[24px] p-4">
        <Textarea
          label="תוכן ההודעה"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="לדוגמה: מבצע סוף שבוע — 10% על כל המוצרים!"
          maxLength={500}
        />
        <Button
          type="button"
          variant="square"
          className="mt-3 w-full"
          disabled={saving}
          onClick={send}
        >
          {saving ? "שולח..." : "שלח לכל הלקוחות"}
        </Button>
      </div>

      {sentAt && (
        <Panel>
          <p className="text-[14px] font-bold text-bakery-muted">הודעה אחרונה נשלחה</p>
          <p className="mt-1 text-[13px] text-bakery-muted">
            {new Date(sentAt).toLocaleString("he-IL")}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-[15px] text-bakery-ink">
            {message}
          </p>
        </Panel>
      )}
    </div>
  );
}
