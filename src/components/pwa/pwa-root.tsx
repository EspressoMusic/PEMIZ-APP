"use client";

import type { ReactNode } from "react";
import { PwaProvider } from "@/components/pwa/pwa-context";

export function PwaRoot({ children }: { children: ReactNode }) {
  return <PwaProvider>{children}</PwaProvider>;
}
