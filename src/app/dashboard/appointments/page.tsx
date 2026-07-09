import { AppointmentsManager } from "@/components/dashboard-client";

export default function AppointmentsPage() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden" data-tour-id="tour-appointments">
      <AppointmentsManager activeOnly />
    </div>
  );
}
