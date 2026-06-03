import { getSession } from "@/lib/auth";
import { isMasterSession } from "@/lib/master-auth";

export async function hasPlatformAdminAccess(): Promise<boolean> {
  const session = await getSession();
  if (session?.role === "ADMIN") return true;
  return isMasterSession();
}
