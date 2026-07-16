import fs from "fs";
import path from "path";

export type PlatformLegalDocId =
  | "terms-of-service"
  | "privacy-policy"
  | "cookie-policy"
  | "refund-cancellation-policy"
  | "acceptable-use-policy"
  | "disclaimer-liability"
  | "accessibility-statement";

export type PlatformLegalDocument = {
  id: PlatformLegalDocId;
  titleHe: string;
  titleEn: string;
  /** Source language of doc.markdown — drives the standalone page's lang/dir. */
  lang: "he" | "en";
  markdown: string;
};

/** Serializable payload for client legal sheet. */
export type PlatformLegalDocPayload = PlatformLegalDocument;

const DOC_META: Record<
  PlatformLegalDocId,
  { file: string; titleHe: string; titleEn: string; lang: "he" | "en" }
> = {
  "terms-of-service": {
    file: "terms-of-service.md",
    titleHe: "תנאי שימוש",
    titleEn: "Terms of Service",
    lang: "en",
  },
  "privacy-policy": {
    file: "privacy-policy.md",
    titleHe: "מדיניות פרטיות",
    titleEn: "Privacy Policy",
    lang: "en",
  },
  "cookie-policy": {
    file: "cookie-policy.md",
    titleHe: "מדיניות עוגיות",
    titleEn: "Cookie Policy",
    lang: "he",
  },
  "refund-cancellation-policy": {
    file: "refund-cancellation-policy.md",
    titleHe: "ביטולים והחזרים",
    titleEn: "Refund & Cancellation Policy",
    lang: "en",
  },
  "acceptable-use-policy": {
    file: "acceptable-use-policy.md",
    titleHe: "שימוש מקובל ותוכן",
    titleEn: "Acceptable Use",
    lang: "he",
  },
  "disclaimer-liability": {
    file: "disclaimer-liability.md",
    titleHe: "הגבלת אחריות",
    titleEn: "Disclaimer",
    lang: "he",
  },
  "accessibility-statement": {
    file: "accessibility-statement.md",
    titleHe: "הצהרת נגישות",
    titleEn: "Accessibility Statement",
    lang: "he",
  },
};

const LEGAL_DIR = path.join(process.cwd(), "legal", "platform");

function readMarkdown(file: string): string {
  const fullPath = path.join(LEGAL_DIR, file);
  return fs.readFileSync(fullPath, "utf8");
}

export function loadPlatformLegalDocument(
  id: PlatformLegalDocId
): PlatformLegalDocument {
  const meta = DOC_META[id];
  return {
    id,
    titleHe: meta.titleHe,
    titleEn: meta.titleEn,
    lang: meta.lang,
    markdown: readMarkdown(meta.file),
  };
}

/** All platform legal docs for in-app viewers (Settings → Legal). */
export function getAllPlatformLegalDocuments(): PlatformLegalDocument[] {
  return (Object.keys(DOC_META) as PlatformLegalDocId[]).map((id) =>
    loadPlatformLegalDocument(id)
  );
}

export const PLATFORM_LEGAL_DOC_IDS = Object.keys(
  DOC_META
) as PlatformLegalDocId[];
