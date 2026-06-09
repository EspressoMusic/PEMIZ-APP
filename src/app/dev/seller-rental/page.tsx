import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import {
  DEV_RENTAL_OWNER_NAME,
  DEV_RENTAL_SELLER_BASE,
  getDevSellerHomeRentalCalendarPreview,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsPreviewPage() {
  const calendarPreview = getDevSellerHomeRentalCalendarPreview();

  return (
    <DevRentalSellerShell>
      <DashboardHomeView
        ownerName={DEV_RENTAL_OWNER_NAME}
        businessSlug="demo-rental"
        businessType="RENTAL"
        basePath={DEV_RENTAL_SELLER_BASE}
        customerLink="/dev/customer-rental"
        previewHref="/dev/customer-rental"
        inquiriesHref={`${DEV_RENTAL_SELLER_BASE}/customers/inquiries`}
        inquiryBellPreview
        appointmentsCalendarPreview={calendarPreview}
      />
    </DevRentalSellerShell>
  );
}
