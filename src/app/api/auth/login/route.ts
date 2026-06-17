import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { jsonError, jsonInfrastructureError, jsonOk, jsonServerError } from "@/lib/api";
import { studioConsolePath } from "@/lib/studio-access";
import { databaseConfigHint, isDatabaseConfigured } from "@/lib/db-env";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { loginSchema, zodFirstError } from "@/lib/validation/schemas";
import {
  authenticateOwnerLogin,
  findLoginCandidates,
  resolveOwnerBusiness,
} from "@/lib/owner-login";

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "auth:login", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(zodFirstError(parsed), 400);
  }

  if (!isDatabaseConfigured()) {
    return jsonInfrastructureError(
      `Database not configured. ${databaseConfigHint()}`,
      "auth:login"
    );
  }

  const identifier = parsed.data.identifier.trim();

  try {
    const user = await authenticateOwnerLogin(identifier, parsed.data.password);
    if (!user) {
      const candidates = await findLoginCandidates(identifier);
      if (candidates.length === 0) {
        return jsonError("No account found with this phone number", 401);
      }
      return jsonError("Incorrect password", 401);
    }

    const business = await resolveOwnerBusiness(user);

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    const consolePath =
      user.role === "ADMIN" ? studioConsolePath() || undefined : undefined;

    return jsonOk({
      userId: user.id,
      role: user.role,
      emailVerified: user.emailVerified,
      hasBusiness: !!business,
      businessActive: business?.isActive ?? false,
      redirectTo: consolePath,
    });
  } catch (error) {
    return jsonServerError(error, "auth:login");
  }
}
