import { WebShell } from "@/components/web-shell";
import { Panel } from "@/components/ui";

export default function TermsPage() {
  return (
    <WebShell>
      <article className="mx-auto w-full max-w-3xl px-4 py-10 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-12">
        <Panel className="space-y-4 text-[15px] leading-[1.45] text-bakery-ink">
          <h1 className="text-[22px] font-extrabold">תנאי שימוש — Linky</h1>
          <p className="text-[14px] text-bakery-muted">עודכן: יוני 2026</p>
          <h2 className="text-[18px] font-bold">הסכמה</h2>
          <p>
            בשימוש ב-Linky ובפתיחת עסק אתה מאשר תנאים אלה ואת מדיניות הפרטיות.
          </p>
          <h2 className="text-[18px] font-bold">השבתת עסק</h2>
          <p>
            מנהל הפלטפורמה רשאי להשבית עסק. עסק מושבת אינו מקבל הזמנות, תורים
            או הודעות; הלקוח רואה הודעה שהעסק אינו זמין.
          </p>
        </Panel>
      </article>
    </WebShell>
  );
}
