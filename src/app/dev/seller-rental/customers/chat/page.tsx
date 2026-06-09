import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardSellerChatManager } from "@/components/dashboard/dashboard-seller-chat-manager";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import {
  DEV_RENTAL_BUSINESS,
  DEV_RENTAL_SELLER_BASE,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsCustomersChatPage() {
  return (
    <DevRentalSellerShell>
      <div className="space-y-4">
        <DashboardCustomersBackLink basePath={DEV_RENTAL_SELLER_BASE} />
        <DashboardSellerChatManager
          isDevPreview
          businessSlug={DEV_RENTAL_BUSINESS.slug}
          businessName={DEV_RENTAL_BUSINESS.name}
        />
      </div>
    </DevRentalSellerShell>
  );
}
