# Linky

פלטפורמת SaaS לעסקים קטנים: עמוד דיגיטלי, קישור ללקוחות (`/b/your-slug`), הזמנות, תורים ופניות — עם דשבורד לבעל העסק ופאנל מנהל פלטפורמה.

## התחלה מהירה

```bash
cd Linky
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000)

## חשבונות לדוגמה

| תפקיד | אימייל | סיסמה |
|--------|--------|--------|
| מנהל פלטפורמה | `admin@linky.local` | `Admin123!` |

בעל עסק: הירשם ב־`/signup` → פתיחת עסק ב־`/onboarding` → ממתין לאישור מנהל → דשבורד.

## זרימה

1. **בעל עסק** — הרשמה, פתיחת עסק (חנות או תורים), אישור מנהל ב־`/master`, דשבורד מלא.
2. **לקוח** — נכנס ל־`/b/{slug}`: מוצרים / תורים / פנייה.
3. **דשבורד** — `/dashboard` — ניהול מוצרים, הזמנות, משבצות, תורים, פניות.
4. **מפתח מנהל** — כפתור מפתח בפינה השמאלית התחתונה → `/master` — כל החנויות, השבתה ומחיקה.

מפתח פיתוח (`.env`): `MASTER_KEY`

עסק מושבת: הלקוח רואה **"This business is currently unavailable."**

## אבטחה (MVP)

- סיסמאות: bcrypt
- סשן: JWT ב־HttpOnly cookie
- אימות מייל: קישור במייל (בפיתוח — קישור במסך `/verify-email`)
- הגנת routes ב־middleware

## משתני סביבה (`.env`)

- `DATABASE_URL` / `DIRECT_URL` — Supabase PostgreSQL (ראה `.env.example`, `DEPLOY.md`)
- `SESSION_SECRET` — מחרוזת ארוכה (32+ תווים)
- `ADMIN_EMAIL` — אימייל שמקבל תפקיד ADMIN ב-seed
- `NEXT_PUBLIC_APP_URL` — כתובת האתר לקישורי שיתוף

## פרודקשן

החלף SQLite ב־PostgreSQL, חבר SMS אמיתי (Twilio וכו׳), והגדר `SESSION_SECRET` חזק.
