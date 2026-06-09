import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasPlatformAdminAccess } from "@/lib/admin-access";
import { jsonError, jsonOk } from "@/lib/api";
import { sendPlatformMessageToOwner } from "@/lib/email";
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
    select: {
      id: true,
      name: true,
      owner: { select: { email: true, name: true } },
    },
  });
  if (!business) return jsonError("חנות לא נמצאה", 404);

  const mail = await sendPlatformMessageToOwner(
    business.owner.email,
    business.owner.name,
    business.name,
    parsed.data.message
  );

  if (!mail.sent && process.env.NODE_ENV === "production") {
    return jsonError("שליחת המייל נכשלה — בדוק הגדרות RESEND_API_KEY", 502);
  }

  return jsonOk({
    sent: mail.sent,
    message: mail.sent
      ? "ההודעה נשלחה למייל של המוכר"
      : "ההודעה נרשמה בלוג השרת (מצב פיתוח)",
  });
}
