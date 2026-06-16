"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type BeforeInstallPromptEvent,
  isStandalonePwa,
} from "@/lib/pwa";
import { isNativeCapacitorApp } from "@/lib/native-app";

export type PwaInstallOutcome =
  | "accepted"
  | "dismissed"
  | "shared"
  | "unavailable";

type PwaContextValue = {
  installed: boolean;
  canInstall: boolean;
  isIos: boolean;
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
  /** Native install prompt when available; iOS opens Share sheet as fallback. */
  tryAddToHomeScreen: () => Promise<PwaInstallOutcome>;
};

const PwaContext = createContext<PwaContextValue | null>(null);

export function PwaProvider({ children }: { children: ReactNode }) {
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (isNativeCapacitorApp()) {
      setInstalled(true);
      return;
    }
    setInstalled(isStandalonePwa());
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return "unavailable";
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    return choice.outcome;
  }, [deferredPrompt]);

  const tryAddToHomeScreen = useCallback(async (): Promise<PwaInstallOutcome> => {
    if (installed) return "accepted";
    if (deferredPrompt) {
      const outcome = await install();
      return outcome === "unavailable" ? "unavailable" : outcome;
    }
    if (isIos && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
        return "shared";
      } catch {
        return "dismissed";
      }
    }
    return "unavailable";
  }, [installed, deferredPrompt, isIos, install]);

  const value = useMemo<PwaContextValue>(
    () => ({
      installed,
      canInstall: Boolean(deferredPrompt),
      isIos,
      install,
      tryAddToHomeScreen,
    }),
    [installed, deferredPrompt, isIos, install, tryAddToHomeScreen]
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  const ctx = useContext(PwaContext);
  if (!ctx) {
    throw new Error("usePwa must be used within PwaProvider");
  }
  return ctx;
}
