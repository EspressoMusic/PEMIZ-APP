import { isInstalledApp } from "@/lib/native-app";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function isStandalonePwa(): boolean {
  return isInstalledApp();
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function isAndroidDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /android/i.test(window.navigator.userAgent);
}

export function pwaBannerDismissKey(surface: string) {
  return `linky-pwa-banner-dismissed-${surface}`;
}

export function isPwaBannerDismissed(surface: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(pwaBannerDismissKey(surface)) === "1";
}

export function dismissPwaBanner(surface: string) {
  localStorage.setItem(pwaBannerDismissKey(surface), "1");
}
