import { resetPasswordWithToken } from "@/lib/password-reset";
import { jsonError, jsonInfrastructureError, jsonOk, jsonServerError } from "@/lib/api";
import { databaseConfigHint, isDatabaseConfigured } from "@/lib/db-env";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { resetPasswordSchema, zodFirstError } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "auth:reset-password", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(zodFirstError(parsed), 400);
  }

  if (!isDatabaseConfigured()) {
    return jsonInfrastructureError(
      `Database not configured. ${databaseConfigHint()}`,
      "auth:reset-password"
    );
  }

  try {
    const result = await resetPasswordWithToken(
      parsed.data.token,
      parsed.data.password
    );
    if (!result.ok) {
      return jsonError(result.error, 400);
    }
    return jsonOk({ message: "Password updated — you can sign in now" });
  } catch (error) {
    return jsonServerError(error, "auth:reset-password");
  }
}
