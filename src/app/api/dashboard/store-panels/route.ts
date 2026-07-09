import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import {
  parseStorePanelsVisible,
  storePanelsFromBusiness,
  storePanelsVisibleToJson,
} from "@/lib/store-panels-visible";

const schema = z.object({
  deals: z.boolean().optional(),
  broadcast: z.boolean().optional(),
  chat: z.boolean().optional(),
  inquiries: z.boolean().optional(),
  faq: z.boolean().optional(),
  orderLimits: z.boolean().optional(),
  settings: z.boolean().optional(),
  reviews: z.boolean().optional(),
  coupons: z.boolean().optional(),
});

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  return jsonOk({ panels: storePanelsFromBusiness(ctx.user.business) });
}

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const current = storePanelsFromBusiness(ctx.user.business);
  const next = { ...current, ...parsed.data };

  const updated = await prisma.business.update({
    where: { id: ctx.user.business.id },
    data: { storePanelsVisible: storePanelsVisibleToJson(next) },
    select: { storePanelsVisible: true },
  });

  return jsonOk({ panels: parseStorePanelsVisible(updated.storePanelsVisible) });
}
