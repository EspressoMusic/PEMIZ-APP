import { redirect } from "next/navigation";
import { DEV_APPOINTMENTS_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsLimitsPage() {
  redirect(`${DEV_APPOINTMENTS_SELLER_BASE}/settings/slots`);
}
