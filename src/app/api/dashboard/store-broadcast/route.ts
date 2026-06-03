import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";

const patchSchema = z.object({
  message: z.string().min(1).max(500),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const b = user.business;
  return jsonOk({
    message: b.storeBroadcast ?? "",
    sentAt: b.storeBroadcastAt?.toISOString() ?? null,
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const updated = await prisma.business.update({
    where: { id: user.business.id },
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
