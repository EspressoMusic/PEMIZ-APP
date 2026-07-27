import { Suspense } from "react";
import { CustomerStoreApp } from "@/components/customer/customer-store-app";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { getAllPlatformLegalDocuments } from "@/lib/legal/platform-legal";

export default async function DevCustomerPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const platformLegalDocs = getAllPlatformLegalDocuments();
  const { locale: localeParam } = await searchParams;
  // Dev-only override — e.g. ?locale=en — to preview the customer storefront
  // in a language other than the fixture's default.
  const business =
    localeParam === "en" || localeParam === "he"
      ? { ...DEV_STORE_BUSINESS, storeLocale: localeParam }
      : DEV_STORE_BUSINESS;

  return (
    <div className="bakery-frame-bg h-dvh overflow-hidden">
      <div className="app-safe-x mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-col overflow-hidden py-4">
        <Suspense fallback={null}>
          <CustomerStoreApp
            business={business}
            unavailable={false}
            platformLegalDocs={platformLegalDocs}
          />
        </Suspense>
      </div>
    </div>
  );
}
