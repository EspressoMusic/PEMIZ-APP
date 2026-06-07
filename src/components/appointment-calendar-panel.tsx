"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type AppointmentMonthCell = {
  day: number | null;
  dateKey: string | null;
};

export const APPOINTMENT_DAY_FRAME =
  "relative flex h-full min-h-[2.25rem] w-full max-h-[3.25rem] items-center justify-center rounded-[10px] border-[2px] text-[15px] font-extrabold transition sm:max-h-[3.5rem] sm:text-[16px]";

export const APPOINTMENT_DAY_FRAME_COMPACT =
  "relative flex h-full min-h-[2.75rem] w-full items-center justify-center rounded-[12px] border-[2px] text-[16px] font-extrabold transition sm:min-h-[3rem] sm:text-[17px]";

export const APPOINTMENT_DAY_FRAME_HOME =
  "relative flex h-full min-h-[2rem] w-full items-center justify-center rounded-[8px] border-[2px] text-[13px] font-extrabold transition sm:text-[14px]";

export const APPOINTMENT_DAY_FRAME_CUSTOMER_HOME =
  "relative flex h-full min-h-[2.5rem] w-full items-center justify-center rounded-[10px] border-[2px] text-[15px] font-extrabold transition sm:text-[16px]";

export function AppointmentCalendarEmptyDay({
  weekIndex,
  cellIndex,
  compact = false,
  home = false,
  homeLarge = false,
}: {
  weekIndex: number;
  cellIndex: number;
  compact?: boolean;
  home?: boolean;
  homeLarge?: boolean;
}) {
  return (
    <span
      key={`empty-${weekIndex}-${cellIndex}`}
      className={
        home
          ? `h-full w-full border-[2px] border-transparent ${
              homeLarge
                ? "min-h-[2.5rem] rounded-[10px]"
                : "min-h-[2rem] rounded-[8px]"
            }`
          : compact
            ? "h-full min-h-[2.75rem] w-full rounded-[12px] border-[2px] border-transparent sm:min-h-[3rem]"
            : "h-full min-h-[2.25rem] max-h-[3.5rem] w-full rounded-[10px] border-[2px] border-transparent"
      }
    />
  );
}

export function AppointmentCalendarPanel({
  monthTitle,
  onPrevMonth,
  onNextMonth,
  prevMonthLabel,
  nextMonthLabel,
  weekdays,
  weeks,
  renderDay,
  compactVertical = false,
  homeCompact = false,
  homeLarge = false,
}: {
  monthTitle: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  prevMonthLabel: string;
  nextMonthLabel: string;
  weekdays: string[];
  weeks: AppointmentMonthCell[][];
  renderDay: (
    cell: AppointmentMonthCell,
    weekIndex: number,
    cellIndex: number
  ) => ReactNode;
  /** Tighter vertical rhythm when the calendar shares the screen with other chrome. */
  compactVertical?: boolean;
  /** Seller home — fixed short day cells; leaves room for upcoming appointments below. */
  homeCompact?: boolean;
  /** Customer home — taller day cells inside homeCompact layout. */
  homeLarge?: boolean;
}) {
  const tight = compactVertical || homeCompact;

  return (
    <div
      className={`flex w-full flex-col ${homeCompact ? "min-h-0 flex-1" : "min-h-0 flex-1"}`}
    >
      <div
        className={`flex w-full flex-col rounded-[18px] border-[3px] border-[#5C4A3E]/22 bg-bakery-square shadow-[0_3px_10px_rgba(58,47,38,0.1)] ${
          homeCompact ? "min-h-0 flex-1" : "min-h-0 flex-1"
        }`}
      >
        <div
          className={`shrink-0 px-3 ${
            homeCompact ? "pb-1 pt-1.5" : tight ? "pb-1.5 pt-2" : "pb-2 pt-2.5"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-2 ${
              homeCompact ? "mb-1" : tight ? "mb-1.5" : "mb-2"
            }`}
          >
            <button
              type="button"
              onClick={onPrevMonth}
              className={`flex shrink-0 items-center justify-center rounded-[14px] border border-bakery-border/35 bg-bakery-card text-bakery-ink transition active:scale-95 ${
                homeCompact ? "h-9 w-9" : tight ? "h-10 w-10" : "h-11 w-11"
              }`}
              aria-label={prevMonthLabel}
            >
              <ChevronLeft
                className={`rtl:rotate-180 ${
                  homeCompact ? "h-4 w-4" : tight ? "h-5 w-5" : "h-6 w-6"
                }`}
                strokeWidth={2}
              />
            </button>
            <p
              className={`text-center font-extrabold capitalize text-bakery-ink ${
                homeCompact ? "text-[17px]" : tight ? "text-[19px]" : "text-[20px]"
              }`}
            >
              {monthTitle}
            </p>
            <button
              type="button"
              onClick={onNextMonth}
              className={`flex shrink-0 items-center justify-center rounded-[14px] border border-bakery-border/35 bg-bakery-card text-bakery-ink transition active:scale-95 ${
                homeCompact ? "h-9 w-9" : tight ? "h-10 w-10" : "h-11 w-11"
              }`}
              aria-label={nextMonthLabel}
            >
              <ChevronRight
                className={`rtl:rotate-180 ${
                  homeCompact ? "h-4 w-4" : tight ? "h-5 w-5" : "h-6 w-6"
                }`}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        <div
          className={`flex flex-col ${
            homeLarge
              ? "mx-3 min-h-0 flex-1 px-2.5 pb-2.5"
              : homeCompact
                ? "mx-2 mb-0 min-h-0 flex-1 px-0.5 sm:mx-3"
                : `mx-2 min-h-0 flex-1 px-0.5 sm:mx-3 ${tight ? "mb-1.5" : "mb-2"}`
          }`}
        >
          <div
            className={`grid grid-cols-7 text-center ${
              homeLarge
                ? "mb-1.5 gap-1.5"
                : homeCompact
                  ? "mb-1 gap-1"
                  : tight
                    ? "mb-1.5 gap-1.5"
                    : "mb-2 gap-1 sm:gap-1.5"
            }`}
          >
            {weekdays.map((wd) => (
              <span
                key={wd}
                className={`font-extrabold text-bakery-ink ${
                  homeCompact
                    ? "py-0 text-[13px]"
                    : tight
                      ? "py-0.5 text-[16px]"
                      : "py-0.5 text-[17px] sm:text-[18px]"
                }`}
              >
                {wd}
              </span>
            ))}
          </div>

          <div
            className={`flex min-h-0 flex-1 flex-col ${
              homeLarge
                ? "gap-1.5"
                : homeCompact
                  ? "gap-1"
                  : tight
                    ? "gap-1.5"
                    : "justify-evenly gap-1 sm:gap-1.5"
            }`}
          >
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className={`grid min-h-0 grid-cols-7 ${
                  homeLarge
                    ? "flex-1 gap-1.5"
                    : homeCompact
                      ? "flex-1 gap-1"
                      : tight
                        ? "flex-1 gap-1.5"
                        : "max-h-14 flex-1 gap-1 sm:gap-1.5"
                }`}
              >
                {week.map((cell, cellIndex) =>
                  cell.day == null || !cell.dateKey ? (
                    <AppointmentCalendarEmptyDay
                      key={`empty-${weekIndex}-${cellIndex}`}
                      weekIndex={weekIndex}
                      cellIndex={cellIndex}
                      compact={tight && !homeCompact}
                      home={homeCompact}
                      homeLarge={homeLarge}
                    />
                  ) : (
                    renderDay(cell, weekIndex, cellIndex)
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
