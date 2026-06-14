"use client";

import dynamic from "next/dynamic";

export const DevPreviewModeSwitchLazy = dynamic(
  () =>
    import("@/components/dashboard/dev-preview-mode-switch").then(
      (mod) => mod.DevPreviewModeSwitch
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="mb-2 h-[46px] shrink-0 rounded-[16px] border border-bakery-border/35 bg-bakery-card/80"
        aria-hidden
      />
    ),
  }
);
