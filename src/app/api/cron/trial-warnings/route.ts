import { jsonError, jsonOk } from "@/lib/api";
import { processTrialWarnings } from "@/lib/trial-warnings";

function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const header = req.headers.get("x-cron-secret");
  return header === secret;
}

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return jsonError("אין הרשאה", 401);
  }

  const result = await processTrialWarnings();
  return jsonOk(result);
}

export async function POST(req: Request) {
  return GET(req);
}
