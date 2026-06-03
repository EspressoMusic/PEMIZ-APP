import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";

const patchSchema = z.object({
  sellerReply: z.string().min(1).max(2000),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const existing = await prisma.inquiry.findFirst({
    where: { id, businessId: user.business.id },
  });
  if (!existing) return jsonError("פנייה לא נמצאה", 404);

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: {
      sellerReply: parsed.data.sellerReply.trim(),
      sellerReplyAt: new Date(),
    },
  });

  return jsonOk({ inquiry });
}
