import { WebShell } from "@/components/web-shell";
import { Panel } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <WebShell>
      <article className="mx-auto w-full max-w-3xl px-4 py-10 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-12">
        <Panel className="prose prose-bakery max-w-none space-y-4 text-[15px] leading-[1.45] text-bakery-ink">
          <h1 className="text-[22px] font-extrabold">מדיניות פרטיות — Linky</h1>
          <p className="text-[14px] text-bakery-muted">עודכן: יוני 2026</p>
          <h2 className="text-[18px] font-bold">מה אנחנו אוספים</h2>
          <p>
            בעת הרשמה: שם, אימייל, סיסמה מוצפנת, מספר טלפון (לאחר אימות). בעת
            פתיחת עסק: שם עסק, לינק, סוג עסק ותיאור. לקוחות שולחים שם, טלפון,
            הודעות והזמנות דרך עמוד העסק הציבורי.
          </p>
          <h2 className="text-[18px] font-bold">שימוש במידע</h2>
          <p>
            המידע משמש להפעלת הפלטפורמה, הצגת עמוד העסק, ניהול הזמנות ותורים,
            אבטחה ותמיכה.
          </p>
          <h2 className="text-[18px] font-bold">אבטחה</h2>
          <p>
            סיסמאות נשמרות בהצפנה. סשנים ב-cookie מאובטח HttpOnly.
          </p>
        </Panel>
      </article>
    </WebShell>
  );
}
