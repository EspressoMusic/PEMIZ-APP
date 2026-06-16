"use client";

import { useEffect, type ReactNode } from "react";
import { isNativeCapacitorApp } from "@/lib/native-app";
import { PwaProvider } from "@/components/pwa/pwa-context";

export function PwaRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isNativeCapacitorApp()) return;
    document.documentElement.classList.add("linky-native-app");
    return () => {
      document.documentElement.classList.remove("linky-native-app");
    };
  }, []);

  return <PwaProvider>{children}</PwaProvider>;
}
