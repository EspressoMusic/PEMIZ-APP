import { isMasterSession } from "@/lib/master-auth";
import { jsonOk } from "@/lib/api";

export async function GET() {
  return jsonOk({ authenticated: await isMasterSession() });
}
