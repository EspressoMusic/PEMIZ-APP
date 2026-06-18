import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasPlatformAdminAccess } from "@/lib/admin-access";
import { jsonError, jsonOk } from "@/lib/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await enforceRateLimit(req, "admin:seller-message", 30, 60 * 60 * 1000);
  if (limited) return limited;

  if (!(await hasPlatformAdminAccess())) return jsonError("אין הרשאה", 403);

  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const business = await prisma.business.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!business) return jsonError("חנות לא נמצאה", 404);

  const sentAt = new Date();
  await prisma.business.update({
    where: { id: business.id },
    data: {
      platformOwnerMessage: parsed.data.message,
      platformOwnerMessageAt: sentAt,
      platformOwnerMessageReadAt: null,
    },
  });

  return jsonOk({
    sent: true,
    sentAt: sentAt.toISOString(),
    message: "ההודעה נשלחה לחנות — המוכר/ת יראו אותה בדשבורד",
  });
}
