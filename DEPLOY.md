# פריסת Linky — Vercel + Supabase

## מה כבר בוצע

- Prisma עבר ל-**PostgreSQL** (Supabase)
- טבלאות Linky נוצרו בפרויקט Supabase **Market** (`qruzhluqmmzlcxksftuh`)
- הפרויקט מקושר ל-Vercel: **linky** (`shilohdhd1-9039s-projects`)

## שלב 1 — מחרוזות חיבור מ-Supabase

1. [Supabase Dashboard](https://supabase.com/dashboard) → פרויקט **Market**
2. **Project Settings** → **Database** → **Connect**
3. העתק:
   - **Transaction pooler** (פורט **6543**) → `DATABASE_URL`  
     חובה: `?pgbouncer=true` בסוף
   - **Direct connection** (פורט **5432**) → `DIRECT_URL`

## שלב 2 — משתני סביבה ב-Vercel

[Vercel → linky → Settings → Environment Variables](https://vercel.com)

הוסף ל-**Production** ו-**Preview** (ול-Development אם עובדים מקומית):

| משתנה | דוגמה / הערה |
|--------|----------------|
| `DATABASE_URL` | מ-Supabase (pooler, 6543) |
| `DIRECT_URL` | מ-Supabase (direct, 5432) |
| `SESSION_SECRET` | מחרוזת אקראית **לפחות 32 תווים** |
| `NEXT_PUBLIC_APP_URL` | `https://linky-xxx.vercel.app` (אחרי פריסה ראשונה) |
| `MASTER_KEY` | מפתח כניסה ל־`/master` |
| `ADMIN_EMAIL` | אימייל מנהל (ל-seed) |

אחרי ההוספה מקומית:

```bash
npx vercel env pull .env.local
```

## שלב 3 — מנהל מערכת (פעם אחת)

```bash
npm run db:seed
```

(דורש `DATABASE_URL` + `DIRECT_URL` ב-`.env.local`)

ברירת מחדל: `admin@linky.local` / `Admin123!`

## שלב 4 — פריסה

```bash
npx vercel --prod
```

אחרי הפריסה עדכן `NEXT_PUBLIC_APP_URL` לכתובת הסופית ופרוס שוב.

## פיתוח מקומי

העתק `.env.example` ל-`.env.local` ומלא את הערכים מ-Supabase + Vercel.

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## הערה על Supabase

באותו פרויקט Supabase קיימות גם טבלאות אחרות (למשל `profiles`, `businesses`).  
Linky משתמש בטבלאות Prisma נפרדות (`User`, `Business`, …) — אין התנגשות בשמות.
