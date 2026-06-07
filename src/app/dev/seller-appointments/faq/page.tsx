import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardSellerPageStack } from "@/components/dashboard/dashboard-panel-frame";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import { FaqManager } from "@/components/faq-manager";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_SELLER_BASE,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsFaqPage() {
  return (
    <DevAppointmentsSellerShell>
      <DashboardSellerPageStack>
        <DashboardCustomersBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <FaqManager
          previewOnly
          initialItems={DEV_APPOINTMENTS_BUSINESS.faqItems}
          initialPolicy={DEV_APPOINTMENTS_BUSINESS.storePolicy}
          initialTerms={DEV_APPOINTMENTS_BUSINESS.storeTerms}
        />
      </DashboardSellerPageStack>
    </DevAppointmentsSellerShell>
  );
}
