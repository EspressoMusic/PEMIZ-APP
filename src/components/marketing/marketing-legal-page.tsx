import { MarketingLegalShell } from "@/components/marketing/marketing-legal-shell";
import type { PlatformLegalDocId } from "@/lib/legal/platform-legal";
import { loadPlatformLegalDocument } from "@/lib/legal/platform-legal";

export function MarketingLegalPage({
  documentId,
}: {
  documentId: PlatformLegalDocId;
}) {
  const doc = loadPlatformLegalDocument(documentId);
  return <MarketingLegalShell markdown={doc.markdown} lang={doc.lang} />;
}
