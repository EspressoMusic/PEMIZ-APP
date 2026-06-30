import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db-env";
import { checkRateLimitDb } from "@/lib/security/rate-limit-db";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

function pruneBuckets() {
  if (buckets.size <= MAX_BUCKETS) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimitKey(req: Request, scope: string): string {
  return `${scope}:${getClientIp(req)}`;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    pruneBuckets();
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

async function checkRateLimitDistributed(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  if (isDatabaseConfigured()) {
    try {
      return await checkRateLimitDb(key, limit, windowMs);
    } catch (error) {
      console.warn("[rate-limit] DB unavailable, using memory fallback", error);
    }
  }
  return checkRateLimit(key, limit, windowMs);
}

export function rateLimitResponse(retryAfterSec: number) {
  return NextResponse.json(
    { error: "יותר מדי בקשות. נסו שוב מאוחר יותר." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}

/** Apply rate limit; returns a Response to return early, or null to continue. */
export async function enforceKeyRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  const result = await checkRateLimitDistributed(key, limit, windowMs);
  if (!result.ok) return rateLimitResponse(result.retryAfterSec);
  return null;
}

/** Apply rate limit; returns a Response to return early, or null to continue. */
export async function enforceRateLimit(
  req: Request,
  scope: string,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  const result = await checkRateLimitDistributed(
    rateLimitKey(req, scope),
    limit,
    windowMs
  );
  if (!result.ok) return rateLimitResponse(result.retryAfterSec);
  return null;
}
