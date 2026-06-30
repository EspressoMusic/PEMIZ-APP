import { requirePlatformAdmin } from "@/lib/admin-access";
import { jsonOk } from "@/lib/api";
import {
  clearSystemIncidents,
  getSystemIncidents,
} from "@/lib/system-incidents";

export async function GET() {
  const denied = await requirePlatformAdmin();
  if (denied) return denied;
  return jsonOk({ incidents: getSystemIncidents() });
}

export async function DELETE() {
  const denied = await requirePlatformAdmin();
  if (denied) return denied;
  clearSystemIncidents();
  return jsonOk({ cleared: true });
}
