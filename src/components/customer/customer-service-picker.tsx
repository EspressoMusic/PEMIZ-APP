"use client";

import type { CustomerLabels } from "./customer-labels";

type ServiceOption = { id: string; name: string };

export function CustomerServicePicker({
  services,
  selectedId,
  onSelect,
  labels,
}: {
  services: ServiceOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  labels: CustomerLabels;
}) {
  if (services.length === 0) {
    return (
      <p className="appointment-slot-empty rounded-[16px] px-4 py-5 text-center text-[14px] font-semibold">
        {labels.noServicesAvailable}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <span className="block text-start text-[14px] font-bold text-bakery-ink">
        {labels.service}
      </span>
      <p className="text-start text-[12px] font-semibold text-bakery-muted">
        {labels.selectService}
      </p>
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
    </div>
  );
}
