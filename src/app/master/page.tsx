import { MasterPanel } from "@/components/master-panel";
import { assertMasterAccessAllowed } from "@/lib/assert-master-access";
import { createMasterSession, isMasterSession } from "@/lib/master-auth";

export default async function MasterPage() {
  await assertMasterAccessAllowed();
  if (!(await isMasterSession())) {
    await createMasterSession();
  }
  return <MasterPanel />;
}
