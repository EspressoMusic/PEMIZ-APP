import type { NextResponse } from "next/server";
import { getCurrentUser, getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import {
  syncBusinessTrialLock,
  trialExpiredErrorMessage,
} from "@/lib/business-subscription";
import { isTrialEnforcedAndExpired } from "@/lib/trial-enforcement";
import { enforceKeyRateLimit } from "@/lib/security/rate-limit";

type AuthUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
type UserWithBusiness = AuthUser & {
  business: NonNullable<AuthUser["business"]>;
};

export type DashboardAuthResult =
  | { ok: true; user: UserWithBusiness }
  | { ok: false; response: NextResponse };

export async function requireBusinessOwner(): Promise<DashboardAuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, response: jsonError("לא מחובר", 401) };
  }
  if (!user.business) {
    return { ok: false, response: jsonError("אין עסק", 404) };
  }

  const limited = await enforceKeyRateLimit(
    `dashboard:${user.id}`,
    400,
    60_000
  );
  if (limited) {
    return { ok: false, response: limited };
  }

  const session = await getSession();
  const adminSupport = session?.adminSupport === true;

  if (!adminSupport) {
    const trialLock = await syncBusinessTrialLock(user.business);
    if (!trialLock.isActive) {
      return { ok: false, response: jsonError("החנות אינה פעילה", 403) };
    }
    if (
      trialLock.locked ||
      (await isTrialEnforcedAndExpired(user.business))
    ) {
      return {
        ok: false,
        response: jsonError(trialExpiredErrorMessage(), 402),
      };
    }
  }

  return { ok: true, user: user as UserWithBusiness };
}

export async function requireStoreOwner(): Promise<DashboardAuthResult> {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx;
  if (ctx.user.business.type !== "STORE") {
    return { ok: false, response: jsonError("עסק לא במצב חנות", 400) };
  }
  return ctx;
}

/** Store, appointments, and rental businesses can configure seller alerts. */
export async function requireSellerAlertsOwner(): Promise<DashboardAuthResult> {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx;
  const type = ctx.user.business.type;
  if (type !== "STORE" && type !== "APPOINTMENTS" && type !== "RENTAL") {
    return { ok: false, response: jsonError("סוג עסק זה לא תומך בהתראות", 400) };
  }
  return ctx;
}
