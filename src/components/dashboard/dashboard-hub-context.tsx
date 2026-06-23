"use client";

import { createContext, useContext } from "react";

export type DashboardHubTab = "home" | "actions";

type DashboardHubContextValue = {
  tab: DashboardHubTab;
  setTab: (tab: DashboardHubTab) => void;
  basePath: string;
};

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
