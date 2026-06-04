import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { storeBroadcastPatchSchema, zodFirstError } from "@/lib/validation/schemas";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const b = ctx.user.business;
  return jsonOk({
    message: b.storeBroadcast ?? "",
    sentAt: b.storeBroadcastAt?.toISOString() ?? null,
  });
}

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = storeBroadcastPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const updated = await prisma.business.update({
    where: { id: ctx.user.business.id },
    data: {
      storeBroadcast: parsed.data.message.trim(),
      storeBroadcastAt: new Date(),
    },
    select: { storeBroadcast: true, storeBroadcastAt: true },
  });

  return jsonOk({
    message: updated.storeBroadcast ?? "",
    sentAt: updated.storeBroadcastAt?.toISOString() ?? null,
  });
}
