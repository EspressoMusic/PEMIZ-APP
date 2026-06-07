import { hasPlatformAdminAccess } from "@/lib/admin-access";
import { jsonError, jsonOk } from "@/lib/api";
import {
  clearSystemIncidents,
  getSystemIncidents,
} from "@/lib/system-incidents";

export async function GET() {
  if (!(await hasPlatformAdminAccess())) {
    return jsonError("אין הרשאה", 403);
  }
  return jsonOk({ incidents: getSystemIncidents() });
}

export async function DELETE() {
  if (!(await hasPlatformAdminAccess())) {
    return jsonError("אין הרשאה", 403);
  }
  clearSystemIncidents();
  return jsonOk({ cleared: true });
}
