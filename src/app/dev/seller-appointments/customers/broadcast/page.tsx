import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardStoreBroadcast } from "@/components/dashboard/dashboard-store-broadcast";
import { DashboardStoreCustomers } from "@/components/dashboard/dashboard-store-customers";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_SELLER_BASE,
  getDevPreviewAppointmentsSeller,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsCustomersBroadcastPage() {
  const previewCustomers = getDevPreviewAppointmentsSeller().map((appt) => ({
    id: appt.id,
    customerName: appt.customerName,
    customerPhone: appt.customerPhone,
    status: appt.status,
    statusLabel: appt.status,
    createdAt: appt.slot.startAt,
    items: [] as { name: string; quantity: number; lineTotal: number; imageUrl: string | null }[],
  }));

  return (
    <DevAppointmentsSellerShell>
      <div className="space-y-4">
        <DashboardCustomersBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <DashboardStoreBroadcast
          previewOnly
          initialMessage={DEV_APPOINTMENTS_BUSINESS.storeBroadcast ?? ""}
          initialSentAt={DEV_APPOINTMENTS_BUSINESS.storeBroadcastAt ?? null}
          initialHistory={DEV_APPOINTMENTS_BUSINESS.storeBroadcastHistory ?? []}
        />
        <DashboardStoreCustomers previewOnly previewOrders={previewCustomers} />
      </div>
    </DevAppointmentsSellerShell>
  );
}
