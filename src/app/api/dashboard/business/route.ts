import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";

export async function DELETE() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  await prisma.business.delete({ where: { id: ctx.user.business.id } });

  return jsonOk({ deleted: true });
}
