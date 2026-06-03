import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SLUG_REGEX } from "@/lib/constants";
import { jsonError, jsonOk } from "@/lib/api";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(3).max(30).regex(SLUG_REGEX),
  description: z.string().max(500).optional(),
  type: z.enum(["STORE", "APPOINTMENTS"]),
  acceptTerms: z.literal(true),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("לא מחובר", 401);
  if (user.business) return jsonError("כבר קיים עסק לחשבון זה", 409);

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const slug = parsed.data.slug.toLowerCase();
  const taken = await prisma.business.findUnique({ where: { slug } });
  if (taken) return jsonError("הלינק כבר תפוס", 409);

  const business = await prisma.business.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      type: parsed.data.type,
      ownerId: user.id,
      termsAcceptedAt: new Date(),
      isActive: false,
    },
  });

  return jsonOk({
    business,
    pendingAdminApproval: true,
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("לא מחובר", 401);
  return jsonOk({ business: user.business });
}
