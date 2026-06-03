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

function toPreviewRows(
  items: { id: string; question: string; answer: string }[]
): FaqRow[] {
  return items.map((item, i) => ({
    ...item,
    isActive: true,
    sortOrder: i,
  }));
}

export function FaqManager({
  previewOnly = false,
  initialItems,
  initialPolicy = "",
  initialTerms = "",
}: {
  previewOnly?: boolean;
  initialItems?: { id: string; question: string; answer: string }[];
  initialPolicy?: string;
  initialTerms?: string;
}) {
  const [items, setItems] = useState<FaqRow[]>(() =>
    previewOnly && initialItems ? toPreviewRows(initialItems) : []
  );
  const [storePolicy, setStorePolicy] = useState(initialPolicy);
  const [storeTerms, setStoreTerms] = useState(initialTerms);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingLegal, setSavingLegal] = useState<"policy" | "terms" | null>(null);
  const [legalMessage, setLegalMessage] = useState("");

  async function load() {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/faq");
    const data = await res.json();
    if (res.ok) setItems(data.items);
  }

  async function loadLegal() {
    if (previewOnly) {
      setStorePolicy(initialPolicy);
      setStoreTerms(initialTerms);
      return;
    }
    const res = await fetch("/api/dashboard/store-legal");
    const data = await res.json();
    if (res.ok) {
      setStorePolicy(data.storePolicy ?? "");
      setStoreTerms(data.storeTerms ?? "");
    }
  }

  useEffect(() => {
    load();
    loadLegal();
  }, [previewOnly]);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setAdding(true);
    const fd = new FormData(e.currentTarget);
    const question = String(fd.get("question") ?? "").trim();
    const answer = String(fd.get("answer") ?? "").trim();

    if (previewOnly) {
      setItems((prev) => [
        ...prev,
        {
          id: `preview-${Date.now()}`,
          question,
          answer,
          isActive: true,
          sortOrder: prev.length,
        },
      ]);
      e.currentTarget.reset();
      setAdding(false);
      return;
    }

    const res = await fetch("/api/dashboard/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(data.error ?? "שגיאה");
      return;
    }
    e.currentTarget.reset();
    load();
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setError("");
    setSavingEdit(true);
    const fd = new FormData(e.currentTarget);
    const question = String(fd.get("question") ?? "").trim();
    const answer = String(fd.get("answer") ?? "").trim();

    if (previewOnly) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, question, answer } : item
        )
      );
      setEditingId(null);
      setSavingEdit(false);
      return;
    }

    const res = await fetch(`/api/dashboard/faq/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    const data = await res.json();
    setSavingEdit(false);
    if (!res.ok) {
      setError(data.error ?? "שגיאה בשמירה");
      return;
    }
    setEditingId(null);
    load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    if (previewOnly) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: !isActive } : item
        )
      );
      return;
    }
    await fetch(`/api/dashboard/faq/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  }

  async function saveLegal(field: "policy" | "terms") {
    setError("");
    setLegalMessage("");
    setSavingLegal(field);
    const body =
      field === "policy"
        ? { storePolicy: storePolicy.trim() || null }
        : { storeTerms: storeTerms.trim() || null };

    if (previewOnly) {
      setSavingLegal(null);
      setLegalMessage("נשמר (תצוגה)");
      setTimeout(() => setLegalMessage(""), 2000);
      return;
    }

    const res = await fetch("/api/dashboard/store-legal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSavingLegal(null);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "שגיאה בשמירה");
      return;
    }
    setLegalMessage("נשמר");
    setTimeout(() => setLegalMessage(""), 2000);
  }

  async function remove(id: string) {
    if (!confirm("למחוק שאלה זו?")) return;
    if (previewOnly) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) setEditingId(null);
      return;
    }
    await fetch(`/api/dashboard/faq/${id}`, { method: "DELETE" });
    if (editingId === id) setEditingId(null);
    load();
  }

  return (
    <div className="space-y-5 pb-2">
      <PageTitle>שאלות ותשובות</PageTitle>

      {error && <Alert variant="error">{error}</Alert>}
      {legalMessage && (
        <p className="text-center text-[14px] font-semibold text-bakery-success">
          {legalMessage}
        </p>
      )}

      <div className="bakery-float-panel rounded-[24px] p-4">
        <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">
          מדיניות החנות
        </h2>
        <div className="mx-auto mt-3 flex w-full max-w-[360px] flex-col gap-3">
          <Textarea
            label="מדיניות (ללקוחות)"
            rows={5}
            value={storePolicy}
            onChange={(e) => setStorePolicy(e.target.value)}
            placeholder="משלוחים, החזרות, אלרגנים, שעות פעילות..."
          />
          <Button
            type="button"
            variant="square"
            className="w-full"
            disabled={savingLegal === "policy"}
            onClick={() => saveLegal("policy")}
          >
            {savingLegal === "policy" ? "שומר..." : "שמור מדיניות"}
          </Button>
        </div>
      </div>

      <div className="bakery-float-panel rounded-[24px] p-4">
        <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">
          תקנון החנות
        </h2>
        <div className="mx-auto mt-3 flex w-full max-w-[360px] flex-col gap-3">
          <Textarea
            label="תקנון (ללקוחות)"
            rows={5}
            value={storeTerms}
            onChange={(e) => setStoreTerms(e.target.value)}
            placeholder="תנאי שימוש, ביטולים, אחריות..."
          />
          <Button
            type="button"
            variant="square"
            className="w-full"
            disabled={savingLegal === "terms"}
            onClick={() => saveLegal("terms")}
          >
            {savingLegal === "terms" ? "שומר..." : "שמור תקנון"}
          </Button>
        </div>
      </div>

      <div className="bakery-float-panel rounded-[24px] p-4">
        <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">
          הוספת שאלה
        </h2>
        <form
          onSubmit={add}
          className="mx-auto mt-4 flex w-full max-w-[360px] flex-col gap-3"
        >
          <Input
            name="question"
            label="שאלה"
            required
            placeholder="לדוגמה: מה שעות הפעילות?"
          />
          <Textarea
            name="answer"
            label="תשובה"
            required
            rows={4}
            placeholder="לדוגמה: א׳–ה׳ 08:00–20:00"
          />
          <Button type="submit" variant="square" className="w-full" disabled={adding}>
            {adding ? "מוסיף..." : "הוסף שאלה"}
          </Button>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-[15px] text-bakery-muted">
          עדיין אין שאלות — הלקוחות יראו הודעה ריקה עד שתוסיף/י.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            return (
              <Panel key={item.id} className="space-y-3">
                {isEditing ? (
                  <form
                    onSubmit={(e) => saveEdit(e, item.id)}
                    className="space-y-3"
                  >
                    <Input
                      name="question"
                      label="שאלה"
                      required
                      defaultValue={item.question}
                    />
                    <Textarea
                      name="answer"
                      label="תשובה"
                      required
                      rows={4}
                      defaultValue={item.answer}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        variant="square"
                        disabled={savingEdit}
                      >
                        {savingEdit ? "שומר..." : "שמור"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setError("");
                        }}
                      >
                        ביטול
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-[17px] font-extrabold text-bakery-ink">
                        {item.question}
                      </p>
                      <Badge tone={item.isActive ? "success" : "default"}>
                        {item.isActive ? "מוצג ללקוחות" : "מוסתר"}
                      </Badge>
                    </div>
                    <p className="whitespace-pre-wrap text-[14px] leading-[1.45] text-bakery-muted">
                      {item.answer}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setError("");
                          setEditingId(item.id);
                        }}
                      >
                        ערוך
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => toggleActive(item.id, item.isActive)}
                      >
                        {item.isActive ? "הסתר" : "הצג"}
                      </Button>
                      <Button variant="danger" onClick={() => remove(item.id)}>
                        מחק
                      </Button>
                    </div>
                  </>
                )}
              </Panel>
            );
          })}
        </ul>
      )}
    </div>
  );
}
