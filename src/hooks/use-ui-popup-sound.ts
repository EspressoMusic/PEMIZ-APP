"use client";

import { useEffect } from "react";
import { playUiPopupSound } from "@/lib/ui-sounds";

/** Plays the standard UI pop when `open` becomes true. */
export function useUiPopupSound(open: boolean) {
  useEffect(() => {
    if (open) playUiPopupSound();
  }, [open]);
}
