"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyDocumentStoreTheme } from "@/lib/apply-store-theme";
import {
  hydrateDashboardTheme,
  writeDashboardThemeSession,
} from "@/lib/dashboard-appearance-session";
import { parseStoreTheme, type StoreThemeId } from "@/lib/store-themes";

type StoreThemeContextValue = {
  theme: StoreThemeId;
  setTheme: (theme: StoreThemeId) => void;
};

const StoreThemeContext = createContext<StoreThemeContextValue | null>(null);

export function StoreThemeProvider({
  children,
  initialTheme = "calm",
}: {
  children: ReactNode;
  initialTheme?: string | null;
}) {
  const [theme, setThemeState] = useState<StoreThemeId>(() =>
    parseStoreTheme(initialTheme)
  );

  const setTheme = useCallback((next: StoreThemeId) => {
    const parsed = parseStoreTheme(next);
    setThemeState(parsed);
    applyDocumentStoreTheme(parsed);
    writeDashboardThemeSession(parsed);
  }, []);

  useLayoutEffect(() => {
    const fromDom = document.documentElement.dataset.storeTheme;
    const hydrated = fromDom
      ? parseStoreTheme(fromDom)
      : hydrateDashboardTheme(initialTheme);
    const parsed = parseStoreTheme(hydrated);
    setThemeState(parsed);
    applyDocumentStoreTheme(parsed);
  }, [initialTheme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <StoreThemeContext.Provider value={value}>{children}</StoreThemeContext.Provider>
  );
}

export function useStoreTheme() {
  const ctx = useContext(StoreThemeContext);
  if (!ctx) {
    return {
      theme: "calm" as StoreThemeId,
      setTheme: () => {},
    };
  }
  return ctx;
}
