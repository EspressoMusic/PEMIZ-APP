import { DashboardInquiriesManager } from "@/components/dashboard/dashboard-inquiries-manager";
import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import {
  DEV_RENTAL_SELLER_BASE,
  DEV_PREVIEW_INQUIRIES,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsInquiriesPage() {
  return (
    <DevRentalSellerShell>
      <div className="space-y-4">
        <DashboardCustomersBackLink basePath={DEV_RENTAL_SELLER_BASE} />
        <DashboardInquiriesManager
          previewOnly
          initialItems={DEV_PREVIEW_INQUIRIES}
        />
      </div>
    </DevRentalSellerShell>
  );
}
