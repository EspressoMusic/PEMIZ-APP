import { CustomerStoreApp } from "@/components/customer/customer-store-app";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { getAllPlatformLegalDocuments } from "@/lib/legal/platform-legal";

export default function DevEmptyProductsPreviewPage() {
  const platformLegalDocs = getAllPlatformLegalDocuments();

  return (
    <div className="bakery-frame-bg h-dvh overflow-hidden">
      <div className="app-safe-x mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-col overflow-hidden py-4">
        <CustomerStoreApp
          business={{ ...DEV_STORE_BUSINESS, products: [] }}
          unavailable={false}
          platformLegalDocs={platformLegalDocs}
        />
      </div>
    </div>
  );
}
