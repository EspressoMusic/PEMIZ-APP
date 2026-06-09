"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import {
  DASHBOARD_ACTION_ROW_CLASS,
  DashboardActionRowButton,
} from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import type { DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
import {
  customerProfileInitial,
  useDashboardCustomerProfile,
} from "@/components/dashboard/dashboard-customer-profile";
import { aggregateStoreCustomers } from "@/lib/store-customers";

export function DashboardStoreCustomers({
  previewOnly = false,
  previewOrders = [] as DashboardOrderView[],
  embedded = false,
}: {
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
  /** Inside the settings panel — no extra outer card. */
  embedded?: boolean;
}) {
  const { labels } = useAppLocale();
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<DashboardOrderView[]>(
    previewOnly ? previewOrders : []
  );
  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly,
    previewOrders: orders,
  });

  useEffect(() => {
    if (previewOnly) {
      setOrders(previewOrders);
      return;
    }

    fetch("/api/dashboard/orders")
      .then((r) => r.json())
      .then((d) => {
        if (!Array.isArray(d.orders)) return;
        setOrders(
          d.orders.map(
            (o: {
              id: string;
              customerName: string;
              customerPhone: string;
              status: string;
              createdAt: string;
            }) => ({
              id: o.id,
              customerName: o.customerName,
              customerPhone: o.customerPhone,
              status: o.status,
              statusLabel: o.status,
              createdAt: o.createdAt,
              items: [],
            })
          )
        );
      })
      .catch(() => {});
  }, [previewOnly, previewOrders]);

  const customers = useMemo(
    () => aggregateStoreCustomers(orders, labels.anonymousCustomer),
    [orders, labels.anonymousCustomer]
  );

  const customersList = (
    <>
      {customers.length > 0 ? (
        <ul className="dashboard-store-customers-list">
          {customers.map((customer) => (
            <li key={customer.phoneKey}>
              <button
                type="button"
                onClick={() =>
                  openCustomer({
                    customerName: customer.customerName,
                    customerPhone: customer.customerPhone,
                    fallbackDate: customer.firstOrderAt,
                  })
                }
                className={`${DASHBOARD_ACTION_ROW_CLASS} hover:opacity-95 active:scale-[0.99]`}
              >
                <span
                  className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] text-[18px] font-extrabold text-bakery-primary"
                  aria-hidden
                >
                    {customerProfileInitial(
                      customer.customerName,
                      labels.anonymousCustomer
                    )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-extrabold leading-tight text-bakery-ink">
                    {customer.customerName}
                  </span>
                  <span
                    className="mt-0.5 block text-[13px] font-medium text-bakery-muted"
                    dir="ltr"
                  >
                    {customer.customerPhone}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dashboard-broadcast-history-empty">{labels.noCustomersYet}</p>
      )}
    </>
  );

  if (embedded) {
    return (
      <>
        <DashboardActionRowButton
          onClick={() => setOpen(true)}
          icon={Users}
          title={labels.customers}
        />
        <DashboardActionSheet
          open={open}
          onClose={() => setOpen(false)}
          title={labels.customers}
          ariaLabel={labels.customers}
          placement="top"
          showBackButton
          panelClassName="dashboard-customers-sheet"
        >
          {customersList}
        </DashboardActionSheet>
        {customerModal}
      </>
    );
  }

  const panel = (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`${DASHBOARD_ACTION_ROW_CLASS}${
          open ? " bakery-float-tile--active" : ""
        }`}
      >
        <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <Users className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
          {labels.customers}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2.5}
          aria-hidden
        />
      </button>

      {open && (
        <div className="dashboard-store-customers-body mt-2">{customersList}</div>
      )}
    </>
  );

  return (
    <>
      <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
        {panel}
      </div>
      {customerModal}
    </>
  );
}
