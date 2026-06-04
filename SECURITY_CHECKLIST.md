# Security checklist — Linky (Next.js + Prisma + Supabase)

## Secrets & environment

- [x] `.gitignore` ignores `.env*` except `.env.example` (no real secrets in git).
- [x] `MASTER_KEY`, `SESSION_SECRET`, and database URLs belong only in `.env.local` / Vercel env — never committed.
- [ ] After `vercel env pull`, remove stale overrides from `.env.development.local` (e.g. old `MASTER_KEY`) so local dev matches intent.

## Authentication & sessions

- [x] Seller session cookie `linky_session`: **httpOnly**, **secure** in production, **sameSite** `strict` (prod) / `lax` (dev).
- [x] Master panel cookie `linky_master`: same hardening via shared `sessionCookieOptions`.
- [x] `getCurrentUser()` uses Prisma **select** without `passwordHash` or verification tokens.
- [x] Login loads `passwordHash` only for bcrypt compare; response never includes it.
- [x] Rate limits: login (10 / 15 min), signup (5 / hour), master login (8 / 15 min) per IP.

## Multi-tenant isolation (server-side)

- [x] Dashboard APIs use `requireBusinessOwner()` / `requireStoreOwner()` — not UI-only hiding.
- [x] Mutations on products, deals, orders, FAQ, inquiries, slots, and chat scope by `businessId` on both **find** and **update/delete**.
- [x] Public store APIs resolve business by **slug** + `isActive`; chat replies validated against same `businessId`.

## Input validation (Zod)

- [x] Central schemas in `src/lib/validation/schemas.ts` for auth, business, products, chat, store theme/legal/broadcast.
- [x] Existing route-level Zod kept where specialized (deals, orders status, order schedule, etc.).

## Rate limiting (in-memory per instance)

- [x] Login, signup, master login, public store chat POST, dashboard product POST, dashboard store chat POST.
- [ ] For strict global limits at scale, add Redis/Upstash (Vercel) — in-memory map resets per serverless instance.

## Images / uploads

- [x] No multipart upload routes; images are data URLs or HTTPS URLs validated server-side.
- [x] Allowed types: **JPEG, PNG, WebP** only; max **2MB**; strict data-URL pattern.
- [x] `generateRandomImageFilename()` in `src/lib/upload-image.ts` for future disk storage (no user filenames).

## HTTP headers

- [x] `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`.

## Admin / master

- [x] Admin APIs require `hasPlatformAdminAccess()` (role + optional master session).
- [x] Production `/master` gated by secret studio path + `MASTER_KEY` password.

## Remaining risks (documented)

- Public **inquiry-updates** and **community chat** are intentionally weak-auth (phone/slug); abuse mitigated by rate limits on chat POST only.
- **In-memory** rate limits are best-effort on Vercel multi-instance.
- Seller **appearance cookies** (theme/locale) are httpOnly but not `secure` in local dev — production uses `secure` when `NODE_ENV=production`.

## Verify locally

```bash
npm run build
npm audit
git ls-files | findstr /i env    # should only show .env.example
```
