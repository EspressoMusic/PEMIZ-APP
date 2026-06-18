import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { HomeLandingShell } from "@/components/home-landing-shell";
import { HomeLandingFooter } from "@/components/home-landing-footer";
import { HomeLandingBottomNav } from "@/components/home-landing-bottom-nav";
import { Panel } from "@/components/ui";
import { LegalDocumentBody } from "@/components/legal/legal-document-body";
import type { PlatformLegalDocId } from "@/lib/legal/platform-legal";
import { loadPlatformLegalDocument } from "@/lib/legal/platform-legal";

export function HomeLandingLegalPage({
  documentId,
}: {
  documentId: PlatformLegalDocId;
}) {
  const doc = loadPlatformLegalDocument(documentId);

  return (
    <HomeLandingShell>
      <article className="app-safe-x px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:py-8">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/"
            className="mb-4 inline-flex min-h-[44px] items-center gap-1 text-[15px] font-extrabold text-bakery-ink transition active:opacity-80"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" strokeWidth={2.5} />
            Back to home
          </Link>
          <Panel className="max-w-none space-y-4">
            <LegalDocumentBody markdown={doc.markdown} />
            <p className="text-center text-[12px] text-bakery-muted">
              Legal draft — review with counsel before relying on this text.
            </p>
          </Panel>
        </div>
      </article>
      <HomeLandingFooter />
      <HomeLandingBottomNav active="home" />
    </HomeLandingShell>
  );
}
