---
name: verify
description: Build/launch/drive recipe for this Next.js app (Linky) — use when verifying a change by actually running it.
---

# Verifying Linky (customer storefront / seller dashboard)

## Launch

```bash
npm run dev   # next dev (Turbopack), binds :3000
```

- **Gotcha:** `next dev` writes a per-directory lock. If a previous
  session's dev server got orphaned (e.g. backgrounded with a trailing
  `&` inside a `run_in_background` Bash call — don't do that, just pass
  the bare command to `run_in_background`), the new one prints
  `⨯ Another next dev server is already running` with the stale PID and
  refuses to bind :3000, falling back to :3001 instead. Find the real
  listener with `netstat -ano | grep :3000 | grep LISTENING` and
  `taskkill //PID <pid> //F` it before relaunching.
- After a change, poll instead of sleeping:
  `timeout 30 bash -c 'until curl -sf http://localhost:3000/dev/customer >/dev/null; do sleep 1; done'`
- Stale `.next/dev/types/routes.d.ts` can fail `tsc --noEmit` with
  parse errors unrelated to your change — that's the known Turbopack
  stale-cache issue; `rm -rf .next` and relaunch to regenerate it, or
  just filter tsc output: `... | grep -v '\.next/dev/types'`.

## Drive it — no DB needed

`src/app/dev/customer/page.tsx` renders `CustomerStoreApp` with a
fixture business (`DEV_STORE_BUSINESS` from `src/lib/dev-preview-data.ts`)
— no Postgres/Supabase connection required. Use
`http://localhost:3000/dev/customer` for any customer-storefront UI
change. (Similar `/dev/seller*` routes exist for dashboard-side previews
— check `src/app/dev/` for the matching fixture page.)

**Caveat:** the fixture business has no real DB row, so any `fetch()`
to `/api/public/[slug]/...` (orders, reviews, etc.) 404s for real. To
exercise a flow that POSTs to those routes, stub them with Playwright's
`page.route()` and return the shape the real handler would — this
still exercises 100% of the changed front-end code, just not the API
route itself.

Playwright is already in `node_modules` (used for other tooling in
this repo) — no `chromium-cli` binary is installed, so drive it with a
plain script instead. **Node module resolution requires the script to
live inside the project tree** (`require('playwright')` walks up from
the script's own path, not cwd) — write throwaway driver scripts at
the repo root as `_pw_*.cjs` and `rm` them when done; never let them
land in a commit.

```js
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
await page.route('**/api/public/*/reviews', async (route) => {
  if (route.request().method() === 'POST') {
    await route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ reviewId: 'x', rewardCoupon: null }) });
  } else {
    await route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ average: 0, count: 0, reviews: [] }) });
  }
});
await page.goto('http://localhost:3000/dev/customer', { waitUntil: 'networkidle' });
```

## Gotchas that recur

- **Cookie-consent banner blocks first click.** A bottom-sheet cookie
  dialog ("עוגיות בחנות זו") covers the nav on first load. Dismiss it
  first: `page.locator('button', { hasText: /רק הכרחי|Only necessary/ }).click()`.
- **Locale defaults to Hebrew (RTL).** Match button/label text in
  both languages, e.g. `/Settings|הגדרות/`, or read `CustomerLabels`
  in `src/components/customer/customer-labels.ts` for the exact pair.
- **`CustomerCenterModal` (`src/components/customer/customer-center-modal.tsx`)
  renders via `createPortal(..., document.body)`**, while
  `CelebrationModal` (`src/components/celebration-modal.tsx`) does
  not. Both use `fixed inset-0 z-[80]`, so when you need a
  `CelebrationModal` (or any plain fixed overlay) to visually sit on
  top of an *already-open* `CustomerCenterModal`-based sheet, wrap it
  in `createPortal(..., document.body)` too — otherwise the portaled
  sheet always wins the stacking order regardless of JSX nesting or
  z-index value, since it gets appended to `<body>` after the app
  root. (Not an issue when the triggering modal fully unmounts first,
  e.g. closing a prompt modal via `onClose()` before opening the next
  `CelebrationModal` — that's the pattern used for the order-success →
  review-prompt → reward-coupon chain in `customer-store-app.tsx`.)
- **Reaching the customer review flows for a test:**
  - Settings-tab route: bottom nav → "Settings"/"הגדרות" → "Reviews"/"ביקורות"
    row → "Add a review"/"הוספת ביקורת".
  - Order-success route: add a product (`button[aria-label="Increase quantity"]`)
    → cart bar "Complete purchase"/"השלמת קניה" → fill the two
    checkout inputs (name, Israeli-format phone e.g. `0501234567`) →
    "Confirm order"/"אישור הזמנה" → success modal "Great"/"מעולה" →
    review prompt auto-opens.
