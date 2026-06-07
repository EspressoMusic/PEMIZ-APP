"use client";

import { DashboardPrepSummary } from "@/components/dashboard/dashboard-prep-summary";
import { DashboardInquiryBell } from "@/components/dashboard/dashboard-inquiry-bell";
import { DashboardCustomerLinkCard } from "@/components/dashboard/dashboard-customer-link-card";
import {
  DashboardAppointmentsHomeCalendar,
  type SellerHomeAppointment,
} from "@/components/dashboard/dashboard-appointments-home-calendar";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import type { PrepProductSummary } from "@/lib/dashboard-prep-summary";
import type { CalendarSlot } from "@/lib/appointment-calendar-shared";

const center = "text-center";
const homeStack = "mx-auto w-full max-w-[360px]";

export function DashboardHomeView({
  ownerName,
  customerLink,
  previewHref,
  prepProducts,
  showPrepSummary,
  prepRefreshFromApi = false,
  businessSlug,
  basePath = "/dashboard",
  inquiriesHref = "/dashboard/customers/inquiries",
  inquiryBellPreview = false,
  businessType = "STORE",
  appointmentsCalendarPreview,
}: {
  ownerName: string;
  customerLink: string;
  previewHref?: string;
  prepProducts?: PrepProductSummary[];
  showPrepSummary?: boolean;
  prepRefreshFromApi?: boolean;
  businessSlug: string;
  basePath?: string;
  inquiriesHref?: string;
  inquiryBellPreview?: boolean;
  businessType?: "STORE" | "APPOINTMENTS";
  appointmentsCalendarPreview?: {
    slots: CalendarSlot[];
    appointments: SellerHomeAppointment[];
    bookingByDay?: boolean;
  };
}) {
  const { labels } = useAppLocale();
  const isAppointments = businessType === "APPOINTMENTS";

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col overflow-hidden ${
        isAppointments ? "py-0.5" : "h-full py-3 sm:py-4"
      } ${center}`}
    >
      <div className={`${homeStack} shrink-0`}>
        <div
          className={
            isAppointments
              ? "dashboard-home-header dashboard-home-header--appointments"
              : "dashboard-home-header"
          }
        >
          <div
            className={`dashboard-home-header__inner relative flex items-center justify-center pe-14 text-center ${
              isAppointments ? "px-3 py-3" : "px-3 py-3.5"
            }`}
          >
            {ownerName.trim() ? (
              <h1
                className={`w-full truncate text-center font-extrabold leading-tight text-bakery-ink ${
                  isAppointments ? "text-[17px]" : "text-[16px]"
                }`}
              >
                {labels.hello}, {ownerName.trim()}!
              </h1>
            ) : null}
            <div className="absolute end-3 inset-y-0 flex items-center">
              <DashboardInquiryBell
                businessSlug={businessSlug}
                basePath={basePath}
                inquiriesHref={inquiriesHref}
                previewOnly={inquiryBellPreview}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${homeStack} min-h-0 flex-1 overflow-hidden ${
          isAppointments
            ? "mt-1.5 grid grid-rows-[minmax(0,1fr)_auto] gap-2"
            : "mt-2 flex flex-col space-y-2 sm:mt-2.5"
        }`}
      >
        {isAppointments ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <DashboardAppointmentsHomeCalendar
              previewOnly={Boolean(appointmentsCalendarPreview)}
              initialSlots={appointmentsCalendarPreview?.slots}
              initialAppointments={appointmentsCalendarPreview?.appointments}
              initialBookingByDay={appointmentsCalendarPreview?.bookingByDay}
            />
          </div>
        ) : showPrepSummary && prepProducts ? (
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            <DashboardPrepSummary
              initialProducts={prepProducts}
              loadFromApi={prepRefreshFromApi}
              fillHeight
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1" aria-hidden />
        )}
        <div className="shrink-0 pb-0.5">
          <DashboardCustomerLinkCard
            url={customerLink}
            previewHref={previewHref}
            dense={isAppointments}
          />
        </div>
      </div>
    </div>
  );
}
