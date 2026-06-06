"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  readDashboardHelpText,
  writeDashboardHelpText,
} from "@/lib/dashboard-ui-preferences";
type Ctx = {
  helpText: boolean;
  setHelpText: (enabled: boolean) => void;
};

const DashboardUiPreferencesContext = createContext<Ctx | null>(null);

export function DashboardUiPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [helpText, setHelpTextState] = useState(false);

  useEffect(() => {
    setHelpTextState(readDashboardHelpText());
  }, []);

  const setHelpText = useCallback((enabled: boolean) => {
    writeDashboardHelpText(enabled);
    setHelpTextState(enabled);
  }, []);

  return (
    <DashboardUiPreferencesContext.Provider value={{ helpText, setHelpText }}>
      {children}
    </DashboardUiPreferencesContext.Provider>
  );
}

export function useDashboardUiPreferences() {
  const ctx = useContext(DashboardUiPreferencesContext);
  if (!ctx) {
    return {
      helpText: false,
      setHelpText: writeDashboardHelpText,
    };
  }
  return ctx;
}

/** מציג ילדים רק כשמופעל «טקסט עזר» בהגדרות */
export function DashboardHelpText({ children }: { children: ReactNode }) {
  const { helpText } = useDashboardUiPreferences();
  if (!helpText) return null;
  return <>{children}</>;
}
