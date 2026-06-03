import { destroyMasterSession } from "@/lib/master-auth";
import { jsonOk } from "@/lib/api";

export async function POST() {
  await destroyMasterSession();
  return jsonOk({ ok: true });
}
