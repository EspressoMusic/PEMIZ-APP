import { notFound } from "next/navigation";
import { CustomerStoreApp } from "@/components/customer/customer-store-app";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";

export default function DevCustomerPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg h-dvh overflow-hidden">
      <div className="app-safe-x mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-col overflow-hidden py-4">
        <CustomerStoreApp business={DEV_STORE_BUSINESS} unavailable={false} />
      </div>
    </div>
  );
}
