"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui";
import { usePwa } from "@/components/pwa/pwa-context";
import {
  dismissPwaBanner,
  isPwaBannerDismissed,
  isStandalonePwa,
} from "@/lib/pwa";
import { isNativeCapacitorApp } from "@/lib/native-app";

type BannerCopy = {
  title: string;
  hint: string;
  install: string;
  dismiss: string;
};

export type PwaInstallBannerSurface = "dashboard" | "customer" | "landing";

/** Whether the fixed install banner is currently floating on screen — layouts that reserve bottom space (e.g. the dashboard nav) need this to avoid the banner overlapping content. */
export function usePwaInstallBannerVisible(surface: PwaInstallBannerSurface) {
  const { canInstall } = usePwa();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isNativeCapacitorApp() || isStandalonePwa() || isPwaBannerDismissed(surface)) return;
    if (canInstall) setVisible(true);
  }, [canInstall, surface]);

  const dismiss = useCallback(() => {
    dismissPwaBanner(surface);
    setVisible(false);
  }, [surface]);

  return { visible, dismiss };
}

export function PwaInstallBanner({
  surface,
  copy,
  state,
}: {
  surface: PwaInstallBannerSurface;
  copy: BannerCopy;
  /** Pass a hook instance the caller already owns (e.g. to also reserve layout space) instead of managing visibility internally. */
  state?: ReturnType<typeof usePwaInstallBannerVisible>;
}) {
  const { install } = usePwa();
  const ownState = usePwaInstallBannerVisible(surface);
  const { visible, dismiss: close } = state ?? ownState;

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 flex justify-center px-3 sm:bottom-4">
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-[20px] border border-bakery-border/45 bg-bakery-card/95 px-3 py-3 shadow-bakery-card backdrop-blur-sm">
        <div className="min-w-0 flex-1 text-start">
          <p className="text-[14px] font-extrabold text-bakery-ink">{copy.title}</p>
          <p className="text-[12px] font-semibold text-bakery-muted">{copy.hint}</p>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 gap-1.5 px-3 text-[13px]"
          onClick={() => void install()}
        >
          <Download className="h-4 w-4" />
          {copy.install}
        </Button>
        <button
          type="button"
          onClick={close}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-bakery-muted transition hover:bg-bakery-cream-hover"
          aria-label={copy.dismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
