import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  orderIds: z.array(z.string()).min(1).max(50),
});

/**
 * Minimal, unauthenticated order-status lookup for the customer's on-device
 * order history. Order ids are unguessable cuids, so knowing one is treated
 * as sufficient authorization — the response is deliberately limited to
 * {id, status} only, never name/phone/address/items, so a leaked id can't
 * expose anything beyond "this order is pending/confirmed/rejected".
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:orders-status:${slug.toLowerCase()}`,
    30,
    10 * 60 * 1000
  );
  if (limited) return limited;

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });
  if (!business || !business.isActive) return jsonError("עסק לא נמצא", 404);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const orders = await prisma.order.findMany({
    where: { id: { in: parsed.data.orderIds }, businessId: business.id },
    select: { id: true, status: true },
  });

  const statuses = Object.fromEntries(orders.map((o) => [o.id, o.status]));
  return jsonOk({ statuses });
}
