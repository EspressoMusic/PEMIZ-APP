import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import {
  INVALID_PHONE_MESSAGE_HE,
  parseIsraeliMobilePhone,
} from "@/lib/phone";
import { customerPhoneSchema } from "@/lib/validation/schemas";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { verifyPublicPhoneOtp } from "@/lib/public-phone-otp";

const schema = z.object({
  phone: customerPhoneSchema,
  code: z.string().min(4).max(8),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:phone:verify:${slug.toLowerCase()}`,
    10,
    15 * 60 * 1000
  );
  if (limited) return limited;

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, isActive: true },
  });
  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("עסק לא זמין", 403);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const phone = parseIsraeliMobilePhone(parsed.data.phone);
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const result = await verifyPublicPhoneOtp(
    business.id,
    phone,
    parsed.data.code.trim()
  );
  if (!result.ok) return jsonError(result.error, 400);

  return jsonOk({ verified: true });
}
