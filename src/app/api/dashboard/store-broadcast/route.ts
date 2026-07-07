import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { storeBroadcastPatchSchema, zodFirstError } from "@/lib/validation/schemas";
import {
  appendBroadcastUpdate,
  mergeBroadcastHistory,
  serializeStoreBroadcastHistory,
} from "@/lib/store-broadcast-history";
import { notifyCustomersBroadcast } from "@/lib/customer-push";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const b = ctx.user.business;
  const history = mergeBroadcastHistory(
    b.storeBroadcastHistory,
    b.storeBroadcast,
    b.storeBroadcastAt
  );
  const latest = history[0];

  return jsonOk({
    message: latest?.message ?? b.storeBroadcast ?? "",
    sentAt: latest?.sentAt ?? b.storeBroadcastAt?.toISOString() ?? null,
    history,
  });
}

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = storeBroadcastPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const b = ctx.user.business;
  const trimmed = parsed.data.message.trim();
  const history = appendBroadcastUpdate(
    b.storeBroadcastHistory,
    b.storeBroadcast,
    b.storeBroadcastAt,
    trimmed
  );
  const latest = history[0];

  const updated = await prisma.business.update({
    where: { id: b.id },
    data: {
      storeBroadcast: latest.message,
      storeBroadcastAt: new Date(latest.sentAt),
      storeBroadcastHistory: serializeStoreBroadcastHistory(history),
    },
    select: {
      storeBroadcast: true,
      storeBroadcastAt: true,
      storeBroadcastHistory: true,
    },
  });

  const nextHistory = mergeBroadcastHistory(
    updated.storeBroadcastHistory,
    updated.storeBroadcast,
    updated.storeBroadcastAt
  );

  void notifyCustomersBroadcast(b.id, trimmed, {
    name: b.name,
    slug: b.slug,
    storeLocale: b.storeLocale,
    storeTheme: b.storeTheme,
  });

  return jsonOk({
    message: updated.storeBroadcast ?? "",
    sentAt: updated.storeBroadcastAt?.toISOString() ?? null,
    history: nextHistory,
  });
}
