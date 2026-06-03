import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateUniqueBusinessSlug } from "@/lib/business";
import { jsonError, jsonOk } from "@/lib/api";

const createSchema = z.object({
  name: z.string().min(2).max(100),
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
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "acceptTerms") {
      return jsonError("יש לאשר את תנאי השימוש ומדיניות הפרטיות");
    }
    return jsonError("בדוק את שם העסק וסוג העסק");
  }

  const slug = await generateUniqueBusinessSlug(parsed.data.name);

  const business = await prisma.business.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      type: parsed.data.type,
      ownerId: user.id,
      termsAcceptedAt: new Date(),
      isActive: true,
      approvedAt: new Date(),
    },
  });

  return jsonOk({ business });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("לא מחובר", 401);
  return jsonOk({ business: user.business });
}

const patchSchema = z.object({
  description: z.string().max(500).nullable().optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מחובר", 401);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const updated = await prisma.business.update({
    where: { id: user.business.id },
    data: {
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description }
        : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      type: true,
      isActive: true,
    },
  });

  return jsonOk({ business: updated });
}
