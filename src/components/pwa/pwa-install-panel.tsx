"use client";

import { Download, Share, Smartphone } from "lucide-react";
import { usePwa } from "@/components/pwa/pwa-context";
import { useNativeApp } from "@/hooks/use-native-app";

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

const installTapClass =
  "w-full cursor-pointer text-start transition active:scale-[0.99] hover:opacity-95";

export function PwaInstallPanel({ copy }: { copy: InstallCopy }) {
  const { installed, canInstall, isIos, tryAddToHomeScreen } = usePwa();
  const nativeApp = useNativeApp();

  function handleTap() {
    void tryAddToHomeScreen();
  }

  if (installed || nativeApp) {
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
    <div className="space-y-4 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={handleTap}
        className={`${installTapClass} rounded-[22px] border-[3px] border-[#6D4C41]/22 bg-bakery-card/80 px-4 py-4 !text-center`}
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[16px] bg-bakery-square/70">
          <Smartphone className="h-7 w-7 text-bakery-primary" strokeWidth={1.75} />
        </div>
        <p className="text-[17px] font-extrabold text-bakery-ink">{copy.title}</p>
        {copy.subtitle.trim() ? (
          <p className="mt-1 text-[13px] font-semibold leading-relaxed text-bakery-muted">
            {copy.subtitle}
          </p>
        ) : null}
        {canInstall ? (
          <p className="mt-2 inline-flex items-center justify-center gap-1.5 text-[14px] font-extrabold text-bakery-primary">
            <Download className="h-4 w-4" strokeWidth={2} />
            {copy.installButton}
          </p>
        ) : null}
      </button>

      {canInstall ? null : isIos ? (
        <button
          type="button"
          onClick={handleTap}
          className={`${installTapClass} rounded-[22px] border-[3px] border-[#6D4C41]/22 bg-bakery-card/60 px-4 py-4`}
        >
          <ol className="space-y-2 text-[14px] font-semibold leading-relaxed text-bakery-ink">
            <li className="flex gap-2">
              <Share className="mt-0.5 h-4 w-4 shrink-0 text-bakery-primary" />
              <span>{copy.iosStep1}</span>
            </li>
            <li>{copy.iosStep2}</li>
            <li>{copy.iosStep3}</li>
          </ol>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleTap}
          className={`${installTapClass} rounded-[18px] border-[3px] border-[#6D4C41]/22 bg-bakery-card/50 px-4 py-3 !text-center text-[13px] font-semibold leading-relaxed text-bakery-muted`}
        >
          {copy.androidHint}
        </button>
      )}
    </div>
  );
}
