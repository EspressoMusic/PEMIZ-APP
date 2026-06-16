import { z } from "zod";
import { hasPlatformAdminAccess } from "@/lib/admin-access";
import { getPlatformConfig, updatePlatformConfig } from "@/lib/platform-config";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  if (!(await hasPlatformAdminAccess())) return jsonError("אין הרשאה", 403);
  const config = await getPlatformConfig();
  return jsonOk({
    signupsEnabled: config.signupsEnabled,
    trialClosureEnabled: config.trialClosureEnabled,
    trialWarningEmailsEnabled: config.trialWarningEmailsEnabled,
    maxAppointmentsPerBusiness: config.maxAppointmentsPerBusiness,
    maxOrderItemsPerOrder: config.maxOrderItemsPerOrder,
  });
}

const limitSchema = z.number().int().min(1).max(100_000);

const patchSchema = z
  .object({
    signupsEnabled: z.boolean().optional(),
    trialClosureEnabled: z.boolean().optional(),
    trialWarningEmailsEnabled: z.boolean().optional(),
    maxAppointmentsPerBusiness: limitSchema.optional(),
    maxOrderItemsPerOrder: limitSchema.optional(),
  })
  .refine(
    (data) =>
      data.signupsEnabled !== undefined ||
      data.trialClosureEnabled !== undefined ||
      data.trialWarningEmailsEnabled !== undefined ||
      data.maxAppointmentsPerBusiness !== undefined ||
      data.maxOrderItemsPerOrder !== undefined,
    { message: "לא סופקו שדות לעדכון" }
  );

export async function PATCH(req: Request) {
  if (!(await hasPlatformAdminAccess())) return jsonError("אין הרשאה", 403);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const config = await updatePlatformConfig(parsed.data);
  return jsonOk({
    signupsEnabled: config.signupsEnabled,
    trialClosureEnabled: config.trialClosureEnabled,
    trialWarningEmailsEnabled: config.trialWarningEmailsEnabled,
    maxAppointmentsPerBusiness: config.maxAppointmentsPerBusiness,
    maxOrderItemsPerOrder: config.maxOrderItemsPerOrder,
  });
}
