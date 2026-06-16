"use client";

import { useEffect, type ReactNode } from "react";
import { PwaProvider } from "@/components/pwa/pwa-context";
import { initNativeSafeArea } from "@/lib/native-safe-area";

export function PwaRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    void initNativeSafeArea();
  }, []);

  return <PwaProvider>{children}</PwaProvider>;
}
