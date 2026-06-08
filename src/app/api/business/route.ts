import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateUniqueBusinessSlug } from "@/lib/business";
import { isBusinessTrialExpired } from "@/lib/business-trial";
import {
  syncBusinessTrialLock,
  trialExpiredErrorMessage,
} from "@/lib/business-subscription";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import {
  businessCreateSchema,
  businessPatchSchema,
  zodFirstError,
} from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("לא מחובר", 401);
  if (user.business) {
    await syncBusinessTrialLock(user.business);
    if (isBusinessTrialExpired(user.business)) {
      return jsonError(trialExpiredErrorMessage(), 402);
    }
    return jsonError("כבר קיים עסק לחשבון זה", 409);
  }

  const body = await req.json().catch(() => null);
  const parsed = businessCreateSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "acceptTerms") {
      return jsonError("יש לאשר את תנאי השימוש ומדיניות הפרטיות");
    }
    if (issue?.path[0] === "type") {
      return jsonError("מצב פגישות יהיה זמין בקרוב — בקרוב! יש למה לחכות!");
    }
    return jsonError(zodFirstError(parsed));
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
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      type: true,
      isActive: true,
      approvedAt: true,
      createdAt: true,
    },
  });

  return jsonOk({ business });
}

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  return jsonOk({ business: ctx.user.business });
}

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = businessPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const updated = await prisma.business.update({
    where: { id: ctx.user.business.id },
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
