"use client";

const STORAGE_PREFIX = "linky:customerGoogleResume:";

export function saveCustomerGoogleResumeSnapshot(slug: string, snapshot: unknown) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(snapshot));
  } catch {}
}

// Pure read, no side effect — safe to call from a useState lazy initializer,
// which React (Strict Mode) may invoke twice in development.
export function peekCustomerGoogleResumeSnapshot<T>(slug: string): T | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + slug);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// Clears the snapshot so a later unrelated reload doesn't keep re-applying
// it. Call once from an effect, not a lazy initializer — removeItem is
// idempotent, so a Strict Mode double-invoke is harmless here.
export function clearCustomerGoogleResumeSnapshot(slug: string) {
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + slug);
  } catch {}
}
