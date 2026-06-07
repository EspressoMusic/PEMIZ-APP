import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_OWNER_NAME,
  DEV_APPOINTMENTS_SELLER_BASE,
  getDevSellerHomeCalendarPreview,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsPreviewPage() {
  const calendarPreview = getDevSellerHomeCalendarPreview();

  return (
    <DevAppointmentsSellerShell>
      <DashboardHomeView
        ownerName={DEV_APPOINTMENTS_OWNER_NAME}
        businessSlug="demo-appointments"
        businessType="APPOINTMENTS"
        basePath={DEV_APPOINTMENTS_SELLER_BASE}
        customerLink="/dev/customer-appointments"
        previewHref="/dev/customer-appointments"
        inquiriesHref={`${DEV_APPOINTMENTS_SELLER_BASE}/customers/inquiries`}
        inquiryBellPreview
        appointmentsCalendarPreview={calendarPreview}
      />
    </DevAppointmentsSellerShell>
  );
}
