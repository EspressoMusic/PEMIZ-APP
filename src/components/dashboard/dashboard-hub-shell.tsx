"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  DashboardHubProvider,
  type DashboardHubTab,
} from "@/components/dashboard/dashboard-hub-context";

function tabFromPathname(pathname: string, basePath: string): DashboardHubTab {
  return pathname === `${basePath}/actions` ||
    pathname === `${basePath}/actions/`
    ? "actions"
    : "home";
}

export function DashboardHubShell({
  basePath = "/dashboard",
  home,
  actions,
  children,
}: {
  basePath?: string;
  home: ReactNode;
  actions: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [tab, setTabState] = useState<DashboardHubTab>(() =>
    tabFromPathname(pathname, basePath)
  );

  useEffect(() => {
    setTabState(tabFromPathname(pathname, basePath));
  }, [pathname, basePath]);

  const setTab = useCallback(
    (next: DashboardHubTab) => {
      const href =
        next === "actions" ? `${basePath}/actions` : basePath;
      window.history.pushState({ dashboardHubTab: next }, "", href);
      setTabState(next);
    },
    [basePath]
  );

  useEffect(() => {
    function onPopState() {
      setTabState(tabFromPathname(window.location.pathname, basePath));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [basePath]);

  return (
    <DashboardHubProvider value={{ tab, setTab, basePath }}>
      <div
        className={
          tab === "home"
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "hidden"
        }
        aria-hidden={tab !== "home"}
      >
        {home}
      </div>
      <div
        className={
          tab === "actions"
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "hidden"
        }
        aria-hidden={tab !== "actions"}
      >
        {actions}
      </div>
      {children}
    </DashboardHubProvider>
  );
}
