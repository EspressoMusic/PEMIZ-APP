import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardSellerChatManager } from "@/components/dashboard/dashboard-seller-chat-manager";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_SELLER_BASE,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsCustomersChatPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="space-y-4">
        <DashboardCustomersBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <DashboardSellerChatManager
          isDevPreview
          businessSlug={DEV_APPOINTMENTS_BUSINESS.slug}
          businessName={DEV_APPOINTMENTS_BUSINESS.name}
        />
      </div>
    </DevAppointmentsSellerShell>
  );
}
