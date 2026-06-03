"use client";

import { useEffect, useState } from "react";
import { Button, Input, Textarea, Panel, Alert, PageTitle, Badge } from "@/components/ui";

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
};

export function FaqManager() {
  const [items, setItems] = useState<FaqRow[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/dashboard/faq");
    const data = await res.json();
    if (res.ok) setItems(data.items);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/dashboard/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: fd.get("question"),
        answer: fd.get("answer"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "שגיאה");
      return;
    }
    e.currentTarget.reset();
    load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/dashboard/faq/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("למחוק שאלה זו?")) return;
    await fetch(`/api/dashboard/faq/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-5">
      <PageTitle>
        שאלות נפוצות
      </PageTitle>

      {error && <Alert variant="error">{error}</Alert>}

      <Panel>
        <h2 className="text-[18px] font-bold text-bakery-ink">הוספת שאלה</h2>
        <form onSubmit={add} className="mt-4 space-y-3">
          <Input name="question" label="שאלה" required placeholder="לדוגמה: מה שעות הפעילות?" />
          <Textarea
            name="answer"
            label="תשובה"
            required
            rows={4}
            placeholder="לדוגמה: א׳–ה׳ 08:00–20:00"
          />
          <Button type="submit" variant="square">
            הוסף לרשימה
          </Button>
        </form>
      </Panel>

      {items.length === 0 ? (
        <p className="text-center text-[15px] text-bakery-muted">
          עדיין אין שאלות — הלקוחות יראו הודעה ריקה עד שתוסיף/י.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <Panel key={item.id} className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-[17px] font-extrabold text-bakery-ink">{item.question}</p>
                <Badge tone={item.isActive ? "success" : "default"}>
                  {item.isActive ? "מוצג ללקוחות" : "מוסתר"}
                </Badge>
              </div>
              <p className="text-[14px] leading-[1.45] text-bakery-muted whitespace-pre-wrap">
                {item.answer}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="ghost" onClick={() => toggleActive(item.id, item.isActive)}>
                  {item.isActive ? "הסתר" : "הצג"}
                </Button>
                <Button variant="danger" onClick={() => remove(item.id)}>
                  מחק
                </Button>
              </div>
            </Panel>
          ))}
        </ul>
      )}
    </div>
  );
}
