"use client";

import { DashboardPrepSummary } from "@/components/dashboard/dashboard-prep-summary";
import { DashboardInquiryBell } from "@/components/dashboard/dashboard-inquiry-bell";
import { DashboardSellerNudge } from "@/components/dashboard/dashboard-seller-nudge";
import { DashboardCustomerLinkCard } from "@/components/dashboard/dashboard-customer-link-card";
import {
  DashboardAppointmentsHomeCalendar,
  type SellerHomeAppointment,
} from "@/components/dashboard/dashboard-appointments-home-calendar";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import type {
  PendingOrderRecord,
  PrepProductSummary,
} from "@/lib/dashboard-prep-summary";
import type { CalendarSlot } from "@/lib/appointment-calendar-shared";
import {
  isRentalBusinessType,
  isScheduleLikeBusinessType,
  type BusinessType,
} from "@/lib/types";

const center = "text-center";
const homeStack = "mx-auto w-full max-w-[360px]";

export function DashboardHomeView({
  ownerName,
  customerLink,
  previewHref,
  prepProducts,
  initialPendingOrders,
  initialOrders,
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
  initialPendingOrders?: PendingOrderRecord[];
  initialOrders?: import("@/components/dashboard/dashboard-order-card").DashboardOrderView[];
  showPrepSummary?: boolean;
  prepRefreshFromApi?: boolean;
  businessSlug: string;
  basePath?: string;
  inquiriesHref?: string;
  inquiryBellPreview?: boolean;
  businessType?: BusinessType;
  appointmentsCalendarPreview?: {
    slots: CalendarSlot[];
    appointments: SellerHomeAppointment[];
    bookingByDay?: boolean;
    referenceNowMs?: number;
    orderScheduleEnabled?: boolean;
    orderSchedule?: string | null;
  };
}) {
  const { labels } = useAppLocale();
  const isAppointments = isScheduleLikeBusinessType(businessType);
  const isRental = isRentalBusinessType(businessType);
  const inquiryBell = (
    <DashboardInquiryBell
      businessSlug={businessSlug}
      basePath={basePath}
      inquiriesHref={inquiriesHref}
      previewOnly={inquiryBellPreview}
      businessType={businessType}
      darkTile
    />
  );

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col overflow-hidden ${
        isAppointments ? "py-0.5" : "h-full py-3 sm:py-4"
      } ${center}`}
    >
      <div className={`${homeStack} shrink-0 ${isAppointments ? "pb-1.5" : "pb-2"}`}>
        <div className="dashboard-home-header dashboard-home-header--greeting relative flex flex-col items-center justify-center px-4 py-3">
          <div className="absolute end-3 top-3 z-10" data-tour-id="tour-home-notifications">
            {inquiryBell}
          </div>
          {ownerName.trim() ? (
            <>
              <h1 className="w-full truncate px-14 text-center text-[18px] font-extrabold leading-tight text-bakery-ink sm:text-[19px]">
                {labels.hello}, {ownerName.trim()}!
              </h1>
              <DashboardSellerNudge
                businessSlug={businessSlug}
                previewOnly={inquiryBellPreview}
                businessType={businessType}
              />
            </>
          ) : (
            <span className="block min-h-[2.75rem] w-full" aria-hidden />
          )}
        </div>
      </div>
      <div
        className={`${homeStack} min-h-0 flex-1 overflow-hidden ${
          isAppointments
            ? "flex min-h-0 flex-1 flex-col gap-2"
            : "grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-2"
        }`}
      >
        {isAppointments ? (
          <div
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            data-tour-id="tour-home-calendar"
          >
            <DashboardAppointmentsHomeCalendar
              previewOnly={Boolean(appointmentsCalendarPreview)}
              initialSlots={appointmentsCalendarPreview?.slots}
              initialAppointments={appointmentsCalendarPreview?.appointments}
              initialBookingByDay={appointmentsCalendarPreview?.bookingByDay}
              initialReferenceNowMs={appointmentsCalendarPreview?.referenceNowMs}
              initialOrderScheduleEnabled={
                appointmentsCalendarPreview?.orderScheduleEnabled
              }
              initialOrderSchedule={appointmentsCalendarPreview?.orderSchedule}
              basePath={basePath}
              rentalMode={isRental}
            />
          </div>
        ) : showPrepSummary && prepProducts ? (
          <div
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
            data-tour-id="tour-home-orders"
          >
            <DashboardPrepSummary
              initialProducts={prepProducts}
              initialOrders={initialOrders}
              initialPendingOrders={initialPendingOrders}
              loadFromApi={prepRefreshFromApi}
              previewOnly={inquiryBellPreview}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1" aria-hidden />
        )}
        <div
          className={`shrink-0 ${
            isAppointments ? "pb-1 pt-0.5" : "pb-1 pt-0.5"
          }`}
        >
          <DashboardCustomerLinkCard
            url={customerLink}
            previewHref={previewHref}
            sellerReturnHref={basePath}
            dense={isAppointments}
          />
        </div>
      </div>
    </div>
  );
}
