import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { WebShell } from "@/components/web-shell";
import { Panel } from "@/components/ui";
import { LegalDocumentBody } from "@/components/legal/legal-document-body";
import type { PlatformLegalDocId } from "@/lib/legal/platform-legal";
import { loadPlatformLegalDocument } from "@/lib/legal/platform-legal";

export function LegalPageShell({ documentId }: { documentId: PlatformLegalDocId }) {
  const doc = loadPlatformLegalDocument(documentId);

  return (
    <WebShell>
      <article className="app-safe-top mx-auto w-full max-w-3xl px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
        <Link
          href="/"
          className="mb-4 inline-flex min-h-[40px] items-center gap-1 text-[15px] font-extrabold text-bakery-ink transition active:opacity-80"
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" strokeWidth={2.5} />
          חזרה
        </Link>
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
