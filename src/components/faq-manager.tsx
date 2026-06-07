"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button, Input, Textarea, Alert } from "@/components/ui";
import {
  DashboardHeading,
  DashboardPanelFrame,
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";
import {
  ChevronDown,
  FileText,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import type { DashboardLabels } from "@/lib/dashboard-messages";

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
};

const faqRowClass =
  "dashboard-action-square flex w-full items-center gap-2.5 rounded-[18px] px-2.5 py-2.5 text-start transition";

function EditorModal({
  open,
  title,
  onClose,
  children,
  footer,
  closeLabel,
  editLabel,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  closeLabel: string;
  editLabel: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? editLabel}
      {...(title ? { "aria-labelledby": "faq-editor-title" } : {})}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <div className="relative max-h-[min(88vh,640px)] w-full max-w-md overflow-y-auto rounded-[24px] border border-bakery-border/30 bg-bakery-square p-5 shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
        <div
          className={
            title
              ? "relative px-10 pt-1"
              : "flex justify-end"
          }
        >
          {title ? (
            <h2
              id="faq-editor-title"
              className="text-center text-[18px] font-extrabold text-bakery-ink"
            >
              {title}
            </h2>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full p-1 text-bakery-muted hover:bg-bakery-card/80 ${
              title ? "absolute end-0 top-0" : ""
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={`space-y-3 ${title ? "mt-4" : "mt-1"}`}>{children}</div>
        <div className="mt-4 flex flex-wrap gap-2">{footer}</div>
      </div>
    </div>
  );
}

function FaqQuestionCard({
  item,
  onEdit,
  onRemove,
  labels,
}: {
  item: FaqRow;
  onEdit: () => void;
  onRemove: () => void;
  labels: DashboardLabels;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="space-y-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${faqRowClass} ${open ? "bakery-float-tile--active" : ""}`}
      >
        <span className="bakery-icon-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]">
          <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-[14px] font-extrabold leading-snug text-bakery-ink">
          <span className="line-clamp-2">{item.question}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-bakery-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2.5}
          aria-hidden
        />
      </button>

      {open && (
        <div className="dashboard-inquiry-expanded space-y-1.5">
          <div className="dashboard-inquiry-bubble px-2.5 py-2 text-center">
            <p className="text-[10px] font-bold text-bakery-muted">{labels.answer}</p>
            <p className="mt-0.5 whitespace-pre-wrap text-[12px] leading-relaxed text-bakery-ink">
              {item.answer}
            </p>
          </div>
          {!item.isActive && (
            <p className="text-center text-[10px] font-bold text-bakery-muted">
              {labels.faqHiddenFromCustomers}
            </p>
          )}
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              className="bakery-icon-tile flex h-8 w-8 items-center justify-center rounded-[10px] transition active:scale-[0.98]"
              aria-label={labels.edit}
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-bakery-error/25 bg-[#f2ebe0] transition hover:bg-bakery-error/10 active:scale-[0.98]"
              aria-label={labels.delete}
            >
              <Trash2
                className="h-6 w-6 text-bakery-sale"
                strokeWidth={2.25}
              />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

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
  const { labels } = useAppLocale();
  const [items, setItems] = useState<FaqRow[]>(() =>
    previewOnly && initialItems ? toPreviewRows(initialItems) : []
  );
  const [storePolicy, setStorePolicy] = useState(initialPolicy);
  const [storeTerms, setStoreTerms] = useState(initialTerms);
  const [error, setError] = useState("");
  const [legalMessage, setLegalMessage] = useState("");

  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingLegal, setSavingLegal] = useState<"policy" | "terms" | null>(null);

  const [policyDraft, setPolicyDraft] = useState(initialPolicy);

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

  function openPolicyModal() {
    setPolicyDraft(storePolicy);
    setPolicyModalOpen(true);
  }

  async function saveLegal(field: "policy" | "terms", value: string) {
    setError("");
    setLegalMessage("");
    setSavingLegal(field);
    const trimmed = value.trim();
    const body =
      field === "policy"
        ? { storePolicy: trimmed || null }
        : { storeTerms: trimmed || null };

    if (previewOnly) {
      if (field === "policy") setStorePolicy(trimmed);
      else setStoreTerms(trimmed);
      setSavingLegal(null);
      setLegalMessage(labels.saved);
      setTimeout(() => setLegalMessage(""), 2000);
      if (field === "policy") setPolicyModalOpen(false);
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
      setError(d.error ?? labels.saveError);
      return;
    }
    const data = await res.json();
    setStorePolicy(data.storePolicy ?? "");
    setStoreTerms(data.storeTerms ?? "");
    setLegalMessage(labels.saved);
    setTimeout(() => setLegalMessage(""), 2000);
    if (field === "policy") setPolicyModalOpen(false);
  }

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
      setAddModalOpen(false);
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
      setError(data.error ?? labels.saveError);
      return;
    }
    e.currentTarget.reset();
    setAddModalOpen(false);
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
      setError(data.error ?? labels.saveError);
      return;
    }
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm(labels.confirmDeleteFaq)) return;
    if (previewOnly) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) setEditingId(null);
      return;
    }
    await fetch(`/api/dashboard/faq/${id}`, { method: "DELETE" });
    if (editingId === id) setEditingId(null);
    load();
  }

  const editingItem = editingId
    ? items.find((item) => item.id === editingId)
    : null;

  return (
    <div
      className={`${DASHBOARD_PAGE_ROOT} flex min-h-0 flex-1 flex-col gap-2`}
    >
      <DashboardPanelFrame className="flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden !border-[3px] !border-[#5C4A3E]/22 !p-3">
        <div className="shrink-0 space-y-2">
          <DashboardHeading className="!text-[18px] sm:!text-[19px]">
            {labels.faq}
          </DashboardHeading>
          {error && <Alert variant="error">{error}</Alert>}
        </div>

        <div className={`${DASHBOARD_SCROLL_MAIN} text-start`}>
          <ul className="space-y-2">
            {items.length === 0 ? (
              <li>
                <p className="dashboard-action-square rounded-[18px] px-2.5 py-4 text-center text-[13px] font-medium text-bakery-muted">
                  {labels.faqNoQuestionsYet}
                </p>
              </li>
            ) : (
              items.map((item) => (
                <FaqQuestionCard
                  key={item.id}
                  item={item}
                  labels={labels}
                  onEdit={() => {
                    setError("");
                    setEditingId(item.id);
                  }}
                  onRemove={() => remove(item.id)}
                />
              ))
            )}
            <li>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setAddModalOpen(true);
                }}
                className={faqRowClass}
              >
                <span className="bakery-icon-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]">
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <span className="min-w-0 flex-1 text-[14px] font-extrabold text-bakery-ink">
                  {labels.addQuestion}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </DashboardPanelFrame>

      <DashboardPanelFrame className="shrink-0 !p-3 text-start">
        {legalMessage && (
          <p className="mb-2 text-center text-[12px] font-semibold text-bakery-success">
            {legalMessage}
          </p>
        )}
        <button type="button" onClick={openPolicyModal} className={faqRowClass}>
          <span className="bakery-icon-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]">
            <FileText className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[14px] font-extrabold text-bakery-ink">
            {labels.faqStorePolicy}
          </span>
        </button>
      </DashboardPanelFrame>

      <EditorModal
        open={policyModalOpen}
        title={labels.faqPolicyTitle}
        closeLabel={labels.close}
        editLabel={labels.edit}
        onClose={() => setPolicyModalOpen(false)}
        footer={
          <>
            <Button
              type="button"
              variant="primary"
              className="flex-1 font-extrabold"
              disabled={savingLegal === "policy"}
              onClick={() => saveLegal("policy", policyDraft)}
            >
              {savingLegal === "policy" ? labels.saving : labels.savePolicy}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPolicyModalOpen(false)}
            >
              {labels.cancel}
            </Button>
          </>
        }
      >
        <Textarea
          rows={10}
          value={policyDraft}
          onChange={(e) => setPolicyDraft(e.target.value)}
          placeholder={labels.policyPlaceholder}
        />
      </EditorModal>

      <EditorModal
        open={addModalOpen}
        title={labels.faqAddQuestion}
        closeLabel={labels.close}
        editLabel={labels.edit}
        onClose={() => setAddModalOpen(false)}
        footer={
          <Button
            type="submit"
            form="faq-add-form"
            variant="primary"
            className="w-full min-h-[48px] rounded-full font-extrabold"
            disabled={adding}
          >
            {adding ? labels.adding : labels.addQuestion}
          </Button>
        }
      >
        <form id="faq-add-form" onSubmit={add} className="space-y-3 text-center">
          <Input
            name="question"
            label={labels.question}
            labelClassName="text-center"
            required
            placeholder={labels.questionPlaceholder}
            className="!rounded-[12px] text-center"
          />
          <Textarea
            name="answer"
            label={labels.answer}
            labelClassName="block w-full text-center"
            required
            rows={5}
            placeholder={labels.answerPlaceholder}
            className="!rounded-[12px] resize-none text-center"
          />
        </form>
      </EditorModal>

      {editingItem && (
        <EditorModal
          open={!!editingId}
          closeLabel={labels.close}
          editLabel={labels.edit}
          onClose={() => {
            setEditingId(null);
            setError("");
          }}
          footer={
            <>
              <Button
                type="submit"
                form="faq-edit-form"
                variant="primary"
                className="flex-1 font-extrabold"
                disabled={savingEdit}
              >
                {savingEdit ? labels.saving : labels.save}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingId(null);
                  setError("");
                }}
              >
                {labels.cancel}
              </Button>
            </>
          }
        >
          <form
            id="faq-edit-form"
            onSubmit={(e) => saveEdit(e, editingItem.id)}
            className="space-y-3"
          >
            <Input
              name="question"
              label={labels.question}
              required
              defaultValue={editingItem.question}
            />
            <Textarea
              name="answer"
              label={labels.answer}
              required
              rows={5}
              defaultValue={editingItem.answer}
              className="!rounded-[12px] resize-none"
            />
          </form>
        </EditorModal>
      )}
    </div>
  );
}
