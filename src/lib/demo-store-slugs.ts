/** Slugs used by the built-in dev/demo storefronts — never real customer data. */
export const DEMO_STORE_SLUGS = [
  "demo-store",
  "demo-appointments",
  "demo-rental",
] as const;

export function isDemoStoreSlug(slug: string): boolean {
  return (DEMO_STORE_SLUGS as readonly string[]).includes(slug);
}
