"use client";

import "@/styles/marketing-site.css";
import { LegalDocumentBody } from "@/components/legal/legal-document-body";
import {
  MarketingPublicFooter,
  MarketingPublicHeader,
} from "@/components/marketing/marketing-public-chrome";
import { marketingPublicPageClassName } from "@/lib/fonts/marketing-fonts";

export function MarketingLegalShell({ markdown }: { markdown: string }) {
  return (
    <div
      className={marketingPublicPageClassName()}
      data-theme="light"
      lang="he"
      dir="rtl"
      style={{ cursor: "auto", minHeight: "100dvh" }}
    >
      <MarketingPublicHeader />

      <article
        className="container public-legal-article"
        style={{ padding: "120px 28px 80px", maxWidth: 820 }}
      >
        <LegalDocumentBody markdown={markdown} variant="marketing" />
      </article>

      <MarketingPublicFooter />
    </div>
  );
}
