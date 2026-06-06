"use client";

import { Download, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui";
import { usePwa } from "@/components/pwa/pwa-context";

type InstallCopy = {
  title: string;
  subtitle: string;
  installedTitle: string;
  installedHint: string;
  installButton: string;
  iosStep1: string;
  iosStep2: string;
  iosStep3: string;
  androidHint: string;
  desktopHint: string;
};

export function PwaInstallPanel({ copy }: { copy: InstallCopy }) {
  const { installed, canInstall, isIos, install } = usePwa();

  if (installed) {
    return (
      <div className="rounded-[22px] border border-bakery-success/35 bg-bakery-success/8 px-4 py-4 text-center">
        <p className="text-[16px] font-extrabold text-bakery-ink">{copy.installedTitle}</p>
        <p className="mt-1 text-[13px] font-semibold leading-relaxed text-bakery-muted">
          {copy.installedHint}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-bakery-border/40 bg-bakery-card/80 px-4 py-4 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[16px] bg-bakery-square/70">
          <Smartphone className="h-7 w-7 text-bakery-primary" strokeWidth={1.75} />
        </div>
        <p className="text-[17px] font-extrabold text-bakery-ink">{copy.title}</p>
        <p className="mt-1 text-[13px] font-semibold leading-relaxed text-bakery-muted">
          {copy.subtitle}
        </p>
      </div>

      {canInstall ? (
        <Button
          type="button"
          className="w-full gap-2"
          onClick={() => void install()}
        >
          <Download className="h-5 w-5" strokeWidth={2} />
          {copy.installButton}
        </Button>
      ) : isIos ? (
        <ol className="space-y-2 rounded-[22px] border border-bakery-border/35 bg-bakery-card/60 px-4 py-4 text-start text-[14px] font-semibold leading-relaxed text-bakery-ink">
          <li className="flex gap-2">
            <Share className="mt-0.5 h-4 w-4 shrink-0 text-bakery-primary" />
            <span>{copy.iosStep1}</span>
          </li>
          <li>{copy.iosStep2}</li>
          <li>{copy.iosStep3}</li>
        </ol>
      ) : (
        <p className="rounded-[18px] border border-bakery-border/30 bg-bakery-card/50 px-4 py-3 text-center text-[13px] font-semibold leading-relaxed text-bakery-muted">
          {copy.androidHint}
        </p>
      )}

      <p className="text-center text-[12px] font-medium leading-relaxed text-bakery-muted">
        {copy.desktopHint}
      </p>
    </div>
  );
}
