# פריסה — Vercel + Supabase (פשוט)

## למה לא הכל אוטומטי?

| מה | למה אני / אתה |
|-----|----------------|
| **סיסמת מסד הנתונים** | Supabase **לא מעבירה** אותה ל-AI — רק לך בדשבורד. בלי זה אי אפשר להתחבר ל-DB. |
| **חיבור Supabase ב-Vercel** | לחיצה אחת **בחשבון Vercel שלך** — ממלאת אוטומטית `POSTGRES_PRISMA_URL` ו-`POSTGRES_URL_NON_POOLING`. |

**כבר הוגדרו ב-Vercel (אוטומטית):** `SESSION_SECRET`, `MASTER_KEY` (בחלק מהסביבות).

---

## מה אתה עושה עכשיו (כ־2 דקות)

### שלב א — חיבור Supabase ל-Vercel (הכי חשוב)

**איפה זה?** לא תמיד תחת Settings. נסה לפי הסדר:

**אפשרות 1 — Storage (הכי נפוץ)**  
1. [Vercel Dashboard](https://vercel.com) → פרויקט **linky**  
2. בטאבים **למעלה** (לא בתפריט Settings בצד): **Storage**  
3. **Connect Database** / **Supabase** → בחר פרויקט **Market**

**אפשרות 2 — Marketplace**  
1. [vercel.com/marketplace/supabase](https://vercel.com/marketplace/supabase)  
2. **Add Integration** → בחר את צוות/חשבון Vercel שלך → פרויקט **linky** → Supabase **Market**

**אפשרות 3 — ידני (בלי אינטגרציה)**  
1. פרויקט **linky** → **Settings** → **Environments** (בצד שמאל, לא Integrations)  
2. **Add Environment Variable** — הדבק מ-Supabase את `POSTGRES_PRISMA_URL` ו-`POSTGRES_URL_NON_POOLING`  
   (Supabase → Market → Settings → Database → **Connect**)

אחרי זה Vercel יוסיף לבד:

- `POSTGRES_PRISMA_URL` — לריצת האתר  
- `POSTGRES_URL_NON_POOLING` — לבנייה / מיגרציות  

(הקוד כבר מוגדר להשתמש בשמות האלה.)

### שלב ב — חיבור GitHub (אם עדיין לא)

1. Vercel → linky → **Settings → Git**
2. חבר את `EspressoMusic/PEMIZ-APP`
3. ענף: `main`

### שלב ג — פריסה

לחץ **Deploy** ב-Vercel, או:

```bash
npx vercel --prod
```

### שלב ד — אחרי שיש כתובת לאתר

1. העתק את ה-URL (למשל `https://linky-xxxxx.vercel.app`)
2. Vercel → Environment Variables → `NEXT_PUBLIC_APP_URL` = אותה כתובת  
3. **Redeploy** פעם אחת

---

## פיתוח מקומי

1. העתק `.env.example` → `.env.local`
2. מ-Supabase (Database → Connect) הדבק ל:
   - `POSTGRES_PRISMA_URL` (pooler, 6543, עם `?pgbouncer=true`)
   - `POSTGRES_URL_NON_POOLING` (direct, 5432)
3. או: `npx vercel env pull .env.local` (אחרי שלב א)

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

מנהל: `admin@linky.local` / `Admin123!`  
מפתח `/master`: `MASTER_KEY` (ב-Vercel כרגע `11` — שנה בפרודקשן).

---

## מאגר קוד

https://github.com/EspressoMusic/PEMIZ-APP
