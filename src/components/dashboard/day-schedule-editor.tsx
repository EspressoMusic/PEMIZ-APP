"use client";

import type { OrderDaySlot } from "@/lib/order-schedule";

export function DayScheduleEditor({
  daySlots,
  dayNames,
  onToggleDay,
  onChangeTime,
  dayToggleHint,
  fromHourLabel,
  toHourLabel,
  welcomeSetup = false,
}: {
  daySlots: OrderDaySlot[];
  dayNames: readonly string[];
  onToggleDay: (day: number) => void;
  onChangeTime: (day: number, field: "startTime" | "endTime", value: string) => void;
  dayToggleHint: string;
  fromHourLabel: string;
  toHourLabel: string;
  welcomeSetup?: boolean;
}) {
  return (
    <ul className="space-y-1">
      {daySlots.map((slot) => (
        <li
          key={slot.day}
          className={`flex items-center gap-2 rounded-[14px] border border-bakery-border/30 bg-bakery-cream-light/80 px-2 py-1.5 transition${
            welcomeSetup ? " appointment-welcome-day-row" : ""
          } ${slot.open ? "" : "opacity-40"}`}
        >
          <button
            type="button"
            onClick={() => onToggleDay(slot.day)}
            className={`min-w-0 flex-1 truncate text-start text-[13px] font-extrabold leading-tight transition ${
              slot.open ? "text-bakery-ink" : "text-bakery-muted line-through"
            }`}
            title={dayToggleHint}
          >
            {dayNames[slot.day]}
          </button>
          <div className="flex shrink-0 items-center justify-end gap-1" dir="ltr">
            <input
              type="time"
              dir="ltr"
              value={slot.startTime}
              disabled={!slot.open}
              onChange={(e) => onChangeTime(slot.day, "startTime", e.target.value)}
              aria-label={`${dayNames[slot.day]} ${fromHourLabel}`}
              className="bakery-field w-[6.5rem] shrink-0 rounded-[8px] border border-bakery-border/32 bg-bakery-input px-1.5 py-1 text-[12px] tabular-nums text-bakery-ink disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="shrink-0 text-[11px] font-bold text-bakery-muted">–</span>
            <input
              type="time"
              dir="ltr"
              value={slot.endTime}
              disabled={!slot.open}
              onChange={(e) => onChangeTime(slot.day, "endTime", e.target.value)}
              aria-label={`${dayNames[slot.day]} ${toHourLabel}`}
              className="bakery-field w-[6.5rem] shrink-0 rounded-[8px] border border-bakery-border/32 bg-bakery-input px-1.5 py-1 text-[12px] tabular-nums text-bakery-ink disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
