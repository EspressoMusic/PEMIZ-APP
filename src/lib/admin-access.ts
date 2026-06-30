import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import type { NextResponse } from "next/server";
import { isMasterSession } from "@/lib/master-auth";
import { enforceKeyRateLimit } from "@/lib/security/rate-limit";
import { prisma } from "@/lib/prisma";

export async function hasPlatformAdminAccess(): Promise<boolean> {
  if (await isMasterSession()) return true;

  const session = await getSession();
  if (!session) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

/** Auth + per-user rate limit for admin API routes. */
export async function requirePlatformAdmin(): Promise<NextResponse | null> {
  if (!(await hasPlatformAdminAccess())) {
    return jsonError("אין הרשאה", 403);
  }

  if (await isMasterSession()) {
    return enforceKeyRateLimit("admin:master", 180, 60_000);
  }

  const session = await getSession();
  if (session) {
    return enforceKeyRateLimit(`admin:${session.userId}`, 240, 60_000);
  }

  return jsonError("אין הרשאה", 403);
}
