"use client";

import {
  CustomerCenterModal,
} from "@/components/customer/customer-center-modal";
import type { CustomerLabels } from "./customer-labels";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";

type ServiceOption = { id: string; name: string };

export function CustomerServicePickerModal({
  open,
  onClose,
  services,
  selectedId,
  onSelect,
  labels,
  locale,
  storeTheme = "turquoise",
}: {
  open: boolean;
  onClose: () => void;
  services: ServiceOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  labels: CustomerLabels;
  locale: CustomerLocale;
  storeTheme?: StoreThemeId;
}) {
  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      title={labels.chooseService}
      locale={locale}
      storeTheme={storeTheme}
      ariaLabel={labels.chooseService}
      panelClassName="customer-service-picker-modal-panel max-h-[min(88dvh,560px)]"
      bodyClassName="px-3 py-3 overflow-y-auto"
    >
      {services.length === 0 ? (
        <p className="appointment-slot-empty rounded-[16px] px-4 py-5 text-center text-[14px] font-semibold">
          {labels.noServicesAvailable}
        </p>
      ) : (
        <ul className="space-y-2" role="listbox" aria-label={labels.service}>
          {services.map((svc) => {
            const selected = svc.id === selectedId;
            return (
              <li key={svc.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onSelect(svc.id)}
                  className={`customer-service-option w-full px-3 py-3 text-[15px] font-bold text-start ${
                    selected ? "customer-service-option--selected" : ""
                  }`}
                >
                  {svc.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </CustomerCenterModal>
  );
}
