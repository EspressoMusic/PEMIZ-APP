import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardSellerPageStack } from "@/components/dashboard/dashboard-panel-frame";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import { FaqManager } from "@/components/faq-manager";
import {
  DEV_RENTAL_BUSINESS,
  DEV_RENTAL_SELLER_BASE,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsFaqPage() {
  return (
    <DevRentalSellerShell>
      <DashboardSellerPageStack>
        <DashboardCustomersBackLink basePath={DEV_RENTAL_SELLER_BASE} />
        <FaqManager
          previewOnly
          initialItems={DEV_RENTAL_BUSINESS.faqItems}
          initialPolicy={DEV_RENTAL_BUSINESS.storePolicy}
          initialTerms={DEV_RENTAL_BUSINESS.storeTerms}
        />
      </DashboardSellerPageStack>
    </DevRentalSellerShell>
  );
}
