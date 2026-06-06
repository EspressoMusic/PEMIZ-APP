"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Users } from "lucide-react";
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
}: {
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
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

  return (
    <>
      <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
            open ? "bakery-float-tile--active" : ""
          }`}
        >
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <Users className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
            {labels.customers}
            {customers.length > 0 && (
              <span className="font-semibold text-bakery-muted">
                {" "}
                ({customers.length})
              </span>
            )}
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
          <div className="dashboard-store-customers-body mt-2">
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
                      className="dashboard-store-customer-item w-full text-start transition hover:opacity-95 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-bakery-border/35 bg-bakery-on-primary text-[18px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]"
                          aria-hidden
                        >
                          {customerProfileInitial(
                            customer.customerName,
                            labels.anonymousCustomer
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-extrabold text-bakery-ink">
                            {customer.customerName}
                          </p>
                          <p
                            className="mt-0.5 text-[13px] font-semibold text-bakery-muted"
                            dir="ltr"
                          >
                            {customer.customerPhone}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-broadcast-history-empty">
                {labels.noCustomersYet}
              </p>
            )}
          </div>
        )}
      </div>
      {customerModal}
    </>
  );
}
