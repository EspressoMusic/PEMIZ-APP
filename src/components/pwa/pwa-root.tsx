"use client";

import { useEffect, type ReactNode } from "react";
import { AppLoadingSplash } from "@/components/app-loading-splash";
import { PwaProvider } from "@/components/pwa/pwa-context";
import { SiteCookieConsent } from "@/components/site-cookie-consent";
import { NativeAppEntryRedirect } from "@/components/native-app-entry-redirect";
import { initNativeSafeArea } from "@/lib/native-safe-area";

export function PwaRoot({
  children,
  locale = "en",
}: {
  children: ReactNode;
  locale?: "en" | "he";
}) {
  useEffect(() => {
    void initNativeSafeArea();
  }, []);

  return (
    <PwaProvider>
      <AppLoadingSplash locale={locale} />
      <NativeAppEntryRedirect />
      {children}
      <SiteCookieConsent />
    </PwaProvider>
  );
}
