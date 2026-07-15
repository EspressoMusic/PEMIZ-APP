import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { demoNotifyEmail } from "@/lib/marketing-demo";
import {
  sendDemoBookingCustomerEmail,
  sendDemoBookingOwnerEmail,
} from "@/lib/email";
import { demoBookingSchema, zodFirstError } from "@/lib/validation/schemas";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "public:demo-booking", 8, 10 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = demoBookingSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const locale = parsed.data.locale === "he" ? "he" : "en";
  const phone = parsed.data.customerPhone?.trim() || null;
  const notes = parsed.data.notes?.trim() || null;

  const booking = await prisma.demoBooking.create({
    data: {
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail.toLowerCase(),
      customerPhone: phone,
      notes,
      locale,
    },
  });

  void sendDemoBookingCustomerEmail({
    to: booking.customerEmail,
    customerName: booking.customerName,
    locale,
  });

  const notifyTo = demoNotifyEmail();
  if (notifyTo) {
    void sendDemoBookingOwnerEmail({
      to: notifyTo,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      notes: booking.notes,
    });
  } else if (process.env.NODE_ENV === "development") {
    console.log("[Demo request] No MARKETING_DEMO_NOTIFY_EMAIL — owner not notified");
  }

  return jsonOk({ bookingId: booking.id });
}
