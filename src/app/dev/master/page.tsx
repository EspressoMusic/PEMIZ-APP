import { MasterPanel } from "@/components/master-panel";
import {
  DEV_MASTER_BUSINESSES,
  DEV_MASTER_PENDING_OWNERS,
} from "@/lib/dev-preview-data";

export default function DevMasterPreviewPage() {
  return (
    <MasterPanel
      previewOnly
      initialBusinesses={DEV_MASTER_BUSINESSES}
      initialPendingOwners={DEV_MASTER_PENDING_OWNERS}
    />
  );
}
