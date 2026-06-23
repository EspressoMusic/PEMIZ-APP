"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CustomerLabels } from "./customer-labels";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import { CustomerServicePickerModal } from "./customer-service-picker-modal";

type ServiceOption = { id: string; name: string };

export function CustomerServicePicker({
  services,
  selectedId,
  onSelect,
  labels,
  locale,
  storeTheme = "calm",
}: {
  services: ServiceOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  labels: CustomerLabels;
  locale: CustomerLocale;
  storeTheme?: StoreThemeId;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const selected = services.find((svc) => svc.id === selectedId);

  if (services.length === 0) {
    return (
      <p className="appointment-slot-empty rounded-[16px] px-4 py-5 text-center text-[14px] font-semibold">
        {labels.noServicesAvailable}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-1.5 text-start">
        <span className="block text-[14px] font-bold text-bakery-ink">
          {labels.service}
        </span>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="customer-service-picker-field flex w-full items-center justify-between gap-2 rounded-2xl border-[1.5px] border-bakery-border/32 bg-bakery-input px-4 py-3 text-start transition hover:bg-bakery-cream-light/60 active:scale-[0.99]"
          aria-haspopup="listbox"
          aria-expanded={modalOpen}
        >
          <span
            className={`min-w-0 flex-1 truncate text-[15px] font-bold ${
              selected ? "text-bakery-ink" : "text-bakery-muted"
            }`}
          >
            {selected?.name ?? labels.selectService}
          </span>
          <ChevronDown
            className="h-5 w-5 shrink-0 text-bakery-muted"
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </div>

      <CustomerServicePickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        services={services}
        selectedId={selectedId}
        onSelect={(id) => {
          onSelect(id);
          setModalOpen(false);
        }}
        labels={labels}
        locale={locale}
        storeTheme={storeTheme}
      />
    </>
  );
}
