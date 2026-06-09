import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/db-env";

export async function checkRateLimitDb(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  const now = Date.now();
  const resetAt = new Date(now + windowMs);
  const existing = await prisma.rateLimitBucket.findUnique({ where: { key } });

  if (!existing || existing.resetAt.getTime() <= now) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(
        1,
        Math.ceil((existing.resetAt.getTime() - now) / 1000)
      ),
    };
  }

  await prisma.rateLimitBucket.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { ok: true };
}
