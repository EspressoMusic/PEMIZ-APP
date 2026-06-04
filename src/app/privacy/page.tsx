import { WebShell } from "@/components/web-shell";
import { Panel } from "@/components/ui";
import { LegalDocumentBody } from "@/components/legal/legal-document-body";
import { loadPlatformLegalDocument } from "@/lib/legal/platform-legal";

export default function PrivacyPage() {
  const doc = loadPlatformLegalDocument("privacy-policy");

  return (
    <WebShell>
      <article className="mx-auto w-full max-w-3xl px-4 py-10 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-12">
        <Panel className="max-w-none space-y-4">
          <LegalDocumentBody markdown={doc.markdown} />
          <p className="text-center text-[12px] text-bakery-muted">
            טיוטה משפטית — יש לעיין בעורך דין לפני הסתמכות.
          </p>
        </Panel>
      </article>
    </WebShell>
  );
}
