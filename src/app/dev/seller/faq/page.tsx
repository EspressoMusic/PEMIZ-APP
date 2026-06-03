import { notFound } from "next/navigation";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FaqManager } from "@/components/faq-manager";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardSellerPageStack } from "@/components/dashboard/dashboard-panel-frame";

export default function DevSellerFaqPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <DashboardShell businessType="STORE" basePath="/dev/seller" storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}>
      <DashboardSellerPageStack>
        <DashboardActionsBackLink basePath="/dev/seller" />
        <FaqManager
          previewOnly
          initialItems={DEV_STORE_BUSINESS.faqItems}
          initialPolicy={DEV_STORE_BUSINESS.storePolicy}
          initialTerms={DEV_STORE_BUSINESS.storeTerms}
        />
      </DashboardSellerPageStack>
    </DashboardShell>
  );
}
