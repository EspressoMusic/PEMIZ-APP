/** True when Prisma can connect (Vercel/Supabase URLs present). */
export function isDatabaseConfigured() {
  return Boolean(
    process.env.POSTGRES_PRISMA_URL?.trim() ||
      process.env.DATABASE_URL?.trim() ||
      process.env.POSTGRES_URL?.trim()
  );
}

export function databaseConfigHint() {
  return "ב-Supabase: Database → Connect → הדבק ל-.env.local את POSTGRES_PRISMA_URL (Transaction pooler) ו-POSTGRES_URL_NON_POOLING (Direct), בלי שורות ריקות. הפעל מחדש: npm run dev";
}
