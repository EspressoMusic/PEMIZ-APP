import { z } from "zod";
import { hasPlatformAdminAccess } from "@/lib/admin-access";
import { getPlatformConfig, setSignupsEnabled } from "@/lib/platform-config";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  if (!(await hasPlatformAdminAccess())) return jsonError("אין הרשאה", 403);
  const config = await getPlatformConfig();
  return jsonOk({ signupsEnabled: config.signupsEnabled });
}

const patchSchema = z.object({
  signupsEnabled: z.boolean(),
});

export async function PATCH(req: Request) {
  if (!(await hasPlatformAdminAccess())) return jsonError("אין הרשאה", 403);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const config = await setSignupsEnabled(parsed.data.signupsEnabled);
  return jsonOk({ signupsEnabled: config.signupsEnabled });
}
