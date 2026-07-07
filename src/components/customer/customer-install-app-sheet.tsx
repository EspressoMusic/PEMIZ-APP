"use client";

import { CustomerCenterModal } from "@/components/customer/customer-center-modal";
import { CustomerPushRegistration } from "@/components/customer/customer-push-registration";
import { PwaInstallPanel } from "@/components/pwa/pwa-install-panel";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";

type Props = {
  open: boolean;
  onClose: () => void;
  locale: CustomerLocale;
  storeTheme?: StoreThemeId;
  slug: string;
  copy: {
    title: string;
    panelTitle: string;
    installedTitle: string;
    installedHint: string;
    installButton: string;
    iosStep1: string;
    iosStep2: string;
    iosStep3: string;
    androidHint: string;
    desktopHint: string;
    pushEnableTitle: string;
    pushEnableHint: string;
    pushSubscribeButton: string;
    pushSubscribed: string;
    pushPermissionDenied: string;
    pushUnsupported: string;
    pushUnconfigured: string;
    pushSubscribeError: string;
    pushServiceUnavailable: string;
    pushIosNeedsInstall: string;
    pushInvalidVapidKey: string;
    pushServiceWorkerFailed: string;
  };
};

export function CustomerInstallAppSheet({
  open,
  onClose,
  locale,
  storeTheme,
  slug,
  copy,
}: Props) {
  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      locale={locale}
      storeTheme={storeTheme}
      title={copy.title}
      panelClassName="customer-profile-modal-panel"
    >
      <PwaInstallPanel
        copy={{
          title: copy.panelTitle,
          subtitle: "",
          installedTitle: copy.installedTitle,
          installedHint: copy.installedHint,
          installButton: copy.installButton,
          iosStep1: copy.iosStep1,
          iosStep2: copy.iosStep2,
          iosStep3: copy.iosStep3,
          androidHint: copy.androidHint,
          desktopHint: copy.desktopHint,
        }}
      />
      <div className="px-4 pb-4">
        <CustomerPushRegistration slug={slug} labels={copy} />
      </div>
    </CustomerCenterModal>
  );
}
