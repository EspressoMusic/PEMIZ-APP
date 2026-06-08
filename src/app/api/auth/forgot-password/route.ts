import { issuePasswordReset } from "@/lib/password-reset";
import { jsonError, jsonInfrastructureError, jsonOk } from "@/lib/api";
import { databaseConfigHint, isDatabaseConfigured } from "@/lib/db-env";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { forgotPasswordSchema, zodFirstError } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "auth:forgot-password", 5, 15 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(zodFirstError(parsed), 400);
  }

  if (!isDatabaseConfigured()) {
    return jsonInfrastructureError(
      `Database not configured. ${databaseConfigHint()}`,
      "auth:forgot-password"
    );
  }

  const email = parsed.data.email.toLowerCase();
  const result = await issuePasswordReset(email);

  return jsonOk({
    message:
      "אם קיים חשבון עם האימייל הזה, נשלח אליך קישור לאיפוס הסיסמה.",
    devResetUrl: result?.resetUrl,
    sent: result?.sent ?? false,
  });
}
