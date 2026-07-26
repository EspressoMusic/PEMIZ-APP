import { MasterLoginGate } from "@/components/master-login-gate";
import { MasterPanel } from "@/components/master-panel";
import { isMasterSession } from "@/lib/master-auth";

export default async function MasterPage() {
  if (!(await isMasterSession())) {
    return <MasterLoginGate />;
  }
  return <MasterPanel />;
}
