import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { isPlatformOwnerMessageUnread } from "@/lib/platform-owner-message";

export async function PATCH() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const b = ctx.user.business;
  if (!b.platformOwnerMessage?.trim() || !b.platformOwnerMessageAt) {
    return jsonOk({ read: true });
  }

  const updated = await prisma.business.update({
    where: { id: b.id },
    data: { platformOwnerMessageReadAt: new Date() },
    select: {
      platformOwnerMessage: true,
      platformOwnerMessageAt: true,
      platformOwnerMessageReadAt: true,
    },
  });

  return jsonOk({
    read: true,
    unread: isPlatformOwnerMessageUnread(
      updated.platformOwnerMessage,
      updated.platformOwnerMessageAt,
      updated.platformOwnerMessageReadAt
    ),
  });
}
