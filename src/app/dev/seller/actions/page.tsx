import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";

export default function DevSellerActionsPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <DashboardShell businessType="STORE" basePath="/dev/seller" storeLocale={DEV_STORE_BUSINESS.storeLocale}>
      <DashboardActionsHub
        businessType="STORE"
        basePath="/dev/seller"
        previewOnly
      />
    </DashboardShell>
  );
}
