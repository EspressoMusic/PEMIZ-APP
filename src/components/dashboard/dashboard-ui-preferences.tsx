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
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { Toggle } from "@/components/ui-toggle";

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

export function DashboardHelpTextToggle() {
  const { helpText, setHelpText } = useDashboardUiPreferences();
  const { labels } = useAppLocale();

  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-bakery-border/25 bg-bakery-cream-light px-3 py-3">
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-[15px] font-extrabold text-bakery-ink">
          {labels.helpTextTitle}
        </span>
        <span className="mt-0.5 block text-[12px] font-semibold text-bakery-muted">
          {labels.helpTextDesc}
        </span>
      </span>
      <Toggle
        enabled={helpText}
        onChange={setHelpText}
        ariaLabel={labels.helpTextTitle}
      />
    </div>
  );
}
