"use client";

import { createContext, useContext } from "react";

export type DashboardHubTab = "home" | "actions";

type DashboardHubContextValue = {
  tab: DashboardHubTab;
  setTab: (tab: DashboardHubTab) => void;
  basePath: string;
};

/** Lets code outside the hub's own React tree (e.g. the seller welcome guide,
 * which wraps the whole shell and sits above DashboardHubProvider) ask the hub
 * to switch tabs via the same history.pushState-based swap DashboardNav uses,
 * instead of a real Next.js navigation between /dashboard and /dashboard/actions. */
export const DASHBOARD_HUB_SET_TAB_EVENT = "linky:dashboard-hub-set-tab";

/** Returns true if a mounted DashboardHubShell handled the request. */
export function requestDashboardHubTab(tab: DashboardHubTab): boolean {
  if (typeof window === "undefined") return false;
  const event = new CustomEvent<DashboardHubTab>(DASHBOARD_HUB_SET_TAB_EVENT, {
    detail: tab,
    cancelable: true,
  });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

const DashboardHubContext = createContext<DashboardHubContextValue | null>(null);

export function DashboardHubProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: DashboardHubContextValue;
}) {
  return (
    <DashboardHubContext.Provider value={value}>
      {children}
    </DashboardHubContext.Provider>
  );
}

export function useDashboardHub() {
  return useContext(DashboardHubContext);
}
