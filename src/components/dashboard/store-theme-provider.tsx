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
import {
  DEFAULT_STORE_DECORATION,
  DEFAULT_STORE_THEME,
  parseStoreDecoration,
  parseStoreTheme,
  type StoreDecorationId,
  type StoreThemeId,
} from "@/lib/store-themes";

type StoreThemeContextValue = {
  theme: StoreThemeId;
  setTheme: (theme: StoreThemeId) => void;
  decoration: StoreDecorationId;
  setDecoration: (decoration: StoreDecorationId) => void;
};

const StoreThemeContext = createContext<StoreThemeContextValue | null>(null);

export function StoreThemeProvider({
  children,
  initialTheme = DEFAULT_STORE_THEME,
  initialDecoration = DEFAULT_STORE_DECORATION,
}: {
  children: ReactNode;
  initialTheme?: string | null;
  initialDecoration?: string | null;
}) {
  const [theme, setThemeState] = useState<StoreThemeId>(() =>
    parseStoreTheme(initialTheme)
  );
  const [decoration, setDecorationState] = useState<StoreDecorationId>(() =>
    parseStoreDecoration(initialDecoration)
  );

  const setTheme = useCallback((next: StoreThemeId) => {
    const parsed = parseStoreTheme(next);
    setThemeState(parsed);
    applyDocumentStoreTheme(parsed);
    writeDashboardThemeSession(parsed);
  }, []);

  const setDecoration = useCallback((next: StoreDecorationId) => {
    setDecorationState(parseStoreDecoration(next));
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

  useLayoutEffect(() => {
    setDecorationState(parseStoreDecoration(initialDecoration));
  }, [initialDecoration]);

  const value = useMemo(
    () => ({ theme, setTheme, decoration, setDecoration }),
    [theme, setTheme, decoration, setDecoration]
  );

  return (
    <StoreThemeContext.Provider value={value}>{children}</StoreThemeContext.Provider>
  );
}

export function useStoreTheme() {
  const ctx = useContext(StoreThemeContext);
  if (!ctx) {
    return {
      theme: DEFAULT_STORE_THEME,
      setTheme: () => {},
      decoration: DEFAULT_STORE_DECORATION,
      setDecoration: () => {},
    };
  }
  return ctx;
}
