import type { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import {
  syncBusinessTrialLock,
  trialExpiredErrorMessage,
} from "@/lib/business-subscription";
import { isBusinessTrialExpired } from "@/lib/business-trial";

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

  const trialLock = await syncBusinessTrialLock(user.business);
  if (!trialLock.isActive) {
    return { ok: false, response: jsonError("החנות אינה פעילה", 403) };
  }
  if (trialLock.locked || isBusinessTrialExpired(user.business)) {
    return {
      ok: false,
      response: jsonError(trialExpiredErrorMessage(), 402),
    };
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
