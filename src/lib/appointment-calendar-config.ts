import {
  clampAppointmentCalendarConfig,
  DEFAULT_APPOINTMENT_CALENDAR,
  type AppointmentCalendarConfig,
} from "@/lib/appointment-slot-generator";

type BusinessCalendarFields = {
  appointmentSlotGapMinutes?: number | null;
  appointmentSlotDurationMinutes?: number | null;
  appointmentBookingStart?: string | null;
  appointmentBookingEnd?: string | null;
  appointmentBookingByDay?: boolean | null;
  appointmentCalendarShowWeekend?: boolean | null;
};

export function calendarConfigFromBusiness(
  business: BusinessCalendarFields
): AppointmentCalendarConfig {
  return clampAppointmentCalendarConfig({
    gapMinutes:
      business.appointmentSlotGapMinutes ??
      DEFAULT_APPOINTMENT_CALENDAR.gapMinutes,
    durationMinutes:
      business.appointmentSlotDurationMinutes ??
      DEFAULT_APPOINTMENT_CALENDAR.durationMinutes,
    bookingStart:
      business.appointmentBookingStart ??
      DEFAULT_APPOINTMENT_CALENDAR.bookingStart,
    bookingEnd:
      business.appointmentBookingEnd ?? DEFAULT_APPOINTMENT_CALENDAR.bookingEnd,
    bookingByDay: business.appointmentBookingByDay ?? false,
    showWeekend: business.appointmentCalendarShowWeekend ?? false,
  });
}

export function calendarConfigToBusinessData(config: AppointmentCalendarConfig) {
  const clamped = clampAppointmentCalendarConfig(config);
  return {
    appointmentSlotGapMinutes: clamped.gapMinutes,
    appointmentSlotDurationMinutes: clamped.durationMinutes,
    appointmentBookingStart: clamped.bookingStart,
    appointmentBookingEnd: clamped.bookingEnd,
    appointmentBookingByDay: clamped.bookingByDay ?? false,
    appointmentCalendarShowWeekend: clamped.showWeekend ?? false,
  };
}
