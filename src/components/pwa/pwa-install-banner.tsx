"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui";
import { usePwa } from "@/components/pwa/pwa-context";
import {
  dismissPwaBanner,
  isPwaBannerDismissed,
  isStandalonePwa,
} from "@/lib/pwa";

type BannerCopy = {
  title: string;
  hint: string;
  install: string;
  dismiss: string;
};

export function PwaInstallBanner({
  surface,
  copy,
}: {
  surface: "dashboard" | "customer" | "landing";
  copy: BannerCopy;
}) {
  const { canInstall, install } = usePwa();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalonePwa() || isPwaBannerDismissed(surface)) return;
    if (canInstall) setVisible(true);
  }, [canInstall, surface]);

  if (!visible) return null;

  function close() {
    dismissPwaBanner(surface);
    setVisible(false);
  }

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
