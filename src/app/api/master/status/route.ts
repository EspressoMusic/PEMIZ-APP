import { jsonError } from "@/lib/api";

/** Deprecated — use /api/admin/businesses to probe session without leaking master state. */
export async function GET() {
  return jsonError("לא נמצא", 404);
}
