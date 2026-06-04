import { MasterLoginGate } from "@/components/master-login-gate";
import { MasterPanel } from "@/components/master-panel";
import { assertMasterAccessAllowed } from "@/lib/assert-master-access";
import { isMasterSession } from "@/lib/master-auth";

export default async function MasterPage() {
  await assertMasterAccessAllowed();
  if (!(await isMasterSession())) {
    return <MasterLoginGate />;
  }
  return <MasterPanel />;
}
