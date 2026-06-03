import { notFound } from "next/navigation";
import { CustomerStoreApp } from "@/components/customer/customer-store-app";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";

export default function DevCustomerPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <CustomerStoreApp business={DEV_STORE_BUSINESS} unavailable={false} />
    </div>
  );
}
