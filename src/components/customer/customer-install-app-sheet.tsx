"use client";

import { CustomerCenterModal } from "@/components/customer/customer-center-modal";
import { PwaInstallPanel } from "@/components/pwa/pwa-install-panel";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";

type Props = {
  open: boolean;
  onClose: () => void;
  locale: CustomerLocale;
  storeTheme?: StoreThemeId;
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
  };
};

export function CustomerInstallAppSheet({
  open,
  onClose,
  locale,
  storeTheme,
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
    </CustomerCenterModal>
  );
}
