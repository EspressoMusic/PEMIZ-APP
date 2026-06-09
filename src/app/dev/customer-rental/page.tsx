import { CustomerStoreApp } from "@/components/customer/customer-store-app";
import { getDevRentalBusiness } from "@/lib/dev-preview-data";
import { getAllPlatformLegalDocuments } from "@/lib/legal/platform-legal";

export default function DevCustomerRentalPreviewPage() {
  const platformLegalDocs = getAllPlatformLegalDocuments();

  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-[#F4F0E8]">
      <div className="flex h-full w-[min(100%,360px)] shrink-0 flex-col overflow-hidden">
        <CustomerStoreApp
          business={getDevRentalBusiness()}
          unavailable={false}
          platformLegalDocs={platformLegalDocs}
        />
      </div>
    </div>
  );
}
