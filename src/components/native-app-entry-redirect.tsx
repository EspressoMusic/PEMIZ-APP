"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CAPACITOR_NATIVE_ENTRY_PATH } from "@/lib/capacitor-entry-path";
import { isNativeCapacitorApp } from "@/lib/native-app";

/** Skip marketing home in the native shell — go straight to seller login / dashboard. */
export function NativeAppEntryRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isNativeCapacitorApp()) return;
    if (pathname !== "/") return;
    router.replace(CAPACITOR_NATIVE_ENTRY_PATH);
  }, [pathname, router]);

  return null;
}
