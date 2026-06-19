"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type AppointmentMonthCell = {
  day: number | null;
  dateKey: string | null;
};

export const APPOINTMENT_DAY_FRAME =
  "relative flex h-full min-h-[2.25rem] w-full max-h-[3.25rem] items-center justify-center rounded-[10px] border-[2px] text-[15px] font-extrabold text-bakery-ink transition sm:max-h-[3.5rem] sm:text-[16px]";

export const APPOINTMENT_DAY_FRAME_SQUARE =
  "relative flex aspect-square w-full items-center justify-center rounded-[12px] border-[2px] text-center text-[17px] font-extrabold leading-none tabular-nums text-bakery-ink transition sm:text-[18px]";

export const APPOINTMENT_DAY_FRAME_SQUARE_LARGE =
  "relative flex aspect-square w-full items-center justify-center rounded-[14px] border-[2.5px] text-center text-[20px] font-extrabold leading-none tabular-nums text-bakery-ink transition sm:text-[22px]";

export const APPOINTMENT_DAY_FRAME_SQUARE_LARGE_FILL =
  "relative flex h-full min-h-0 w-full items-center justify-center rounded-[14px] border-[2.5px] text-center text-[20px] font-extrabold leading-none tabular-nums text-bakery-ink transition sm:text-[22px]";

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
  square = false,
  squareLarge = false,
  fillHeight = false,
}: {
  weekIndex: number;
  cellIndex: number;
  compact?: boolean;
  home?: boolean;
  homeLarge?: boolean;
  square?: boolean;
  squareLarge?: boolean;
  fillHeight?: boolean;
}) {
  return (
    <span
      key={`empty-${weekIndex}-${cellIndex}`}
      className={
        squareLarge
          ? fillHeight
            ? "appointment-calendar-empty--fill"
            : "aspect-square w-full rounded-[14px] border-[2.5px] border-transparent"
          : square
            ? "aspect-square w-full rounded-[12px] border-[2px] border-transparent"
          : home
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
  squareDays = false,
  squareDaysLarge = false,
  fillHeight = false,
  lightNavButtons = false,
  weekColumnCount = 7,
  panelClassName,
  visualVariant = "bakery",
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
  /** Modal / full-width calendar — square day cells sized from column width. */
  squareDays?: boolean;
  /** Wider modal calendar — larger squares and tighter side margins. */
  squareDaysLarge?: boolean;
  /** Stretch square day cells to fill available vertical space (seller home). */
  fillHeight?: boolean;
  /** Lighter prev/next month controls (seller home calendar). */
  lightNavButtons?: boolean;
  /** 1–7 columns; only open weekdays from the seller schedule are shown. */
  weekColumnCount?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Override inner calendar panel surface (e.g. lighter home calendar). */
  panelClassName?: string;
  /** Modern mint/white style for appointments stores. */
  visualVariant?: "bakery" | "modern";
}) {
  const tight = compactVertical || homeCompact;
  const isSquare = squareDays || squareDaysLarge;
  const stretchSquare = fillHeight && squareDaysLarge;
  const isModern = visualVariant === "modern";
  const navButtonClass = isModern
    ? "appointment-calendar-nav-btn"
    : lightNavButtons
      ? "border-bakery-border/20 bg-bakery-cream-light/90 text-bakery-muted"
      : "border-bakery-border/35 bg-bakery-card text-bakery-ink";
  const navIconClass = isModern ? "" : lightNavButtons ? "text-bakery-muted/75" : "";
  const weekGridClass =
    weekColumnCount === 1
      ? "grid-cols-1"
      : weekColumnCount === 2
        ? "grid-cols-2"
        : weekColumnCount === 3
          ? "grid-cols-3"
          : weekColumnCount === 4
            ? "grid-cols-4"
            : weekColumnCount === 5
              ? "grid-cols-5"
              : weekColumnCount === 6
                ? "grid-cols-6"
                : "grid-cols-7";
  const dayGap = squareDaysLarge
    ? "gap-2.5"
    : squareDays
      ? "gap-2"
      : homeLarge
        ? "gap-1.5"
        : homeCompact
          ? "gap-1"
          : tight
            ? "gap-1.5"
            : "gap-1 sm:gap-1.5";

  return (
    <div
      className={`flex w-full flex-col ${homeCompact ? "min-h-0 flex-1" : "min-h-0 flex-1"}${isModern ? " appointment-calendar-modern" : ""}`}
    >
      <div
        className={`flex w-full flex-col ${
          isModern
            ? "appointment-calendar-modern-surface min-h-0 flex-1"
            : `rounded-[18px] border-[3px] border-[#5C4A3E]/22 bg-bakery-square shadow-[0_3px_10px_rgba(58,47,38,0.1)] ${homeCompact ? "min-h-0 flex-1" : "min-h-0 flex-1"}`
        }${panelClassName ? ` ${panelClassName}` : ""}`}
      >
        <div
          className={`shrink-0 ${
            stretchSquare
              ? "px-2 pb-1 pt-0"
              : squareDaysLarge
                ? "px-2 pb-1.5 pt-2"
                : homeCompact
                  ? "px-3 pb-1 pt-1.5"
                  : tight
                    ? "px-3 pb-1.5 pt-2"
                    : "px-3 pb-2 pt-2.5"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-2 ${
              squareDaysLarge ? "mb-2" : homeCompact ? "mb-1" : tight ? "mb-1.5" : "mb-2"
            }`}
          >
            <button
              type="button"
              onClick={onPrevMonth}
              className={`appointment-calendar-nav-btn flex shrink-0 items-center justify-center border transition active:scale-95 ${navButtonClass} ${
                isModern
                  ? squareDaysLarge
                    ? "h-10 w-10"
                    : "h-9 w-9"
                  : squareDaysLarge
                    ? "h-11 w-11 rounded-[14px]"
                    : homeCompact
                      ? "h-9 w-9 rounded-[14px]"
                      : tight
                        ? "h-10 w-10 rounded-[14px]"
                        : "h-11 w-11 rounded-[14px]"
              }`}
              aria-label={prevMonthLabel}
            >
              <ChevronLeft
                className={`rtl:rotate-180 ${navIconClass} ${
                  squareDaysLarge ? "h-6 w-6" : homeCompact ? "h-4 w-4" : tight ? "h-5 w-5" : "h-6 w-6"
                }`}
                strokeWidth={2}
              />
            </button>
            <p
              className={`appointment-calendar-month-title text-center font-extrabold capitalize ${
                isModern ? "text-bakery-ink" : "text-bakery-ink"
              } ${
                squareDaysLarge
                  ? "text-[21px] sm:text-[22px]"
                  : homeCompact
                    ? "text-[17px]"
                    : tight
                      ? "text-[19px]"
                      : "text-[20px]"
              }`}
            >
              {monthTitle}
            </p>
            <button
              type="button"
              onClick={onNextMonth}
              className={`appointment-calendar-nav-btn flex shrink-0 items-center justify-center border transition active:scale-95 ${navButtonClass} ${
                isModern
                  ? squareDaysLarge
                    ? "h-10 w-10"
                    : "h-9 w-9"
                  : squareDaysLarge
                    ? "h-11 w-11 rounded-[14px]"
                    : homeCompact
                      ? "h-9 w-9 rounded-[14px]"
                      : tight
                        ? "h-10 w-10 rounded-[14px]"
                        : "h-11 w-11 rounded-[14px]"
              }`}
              aria-label={nextMonthLabel}
            >
              <ChevronRight
                className={`rtl:rotate-180 ${navIconClass} ${
                  squareDaysLarge ? "h-6 w-6" : homeCompact ? "h-4 w-4" : tight ? "h-5 w-5" : "h-6 w-6"
                }`}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        <div
          className={`flex flex-col ${
            stretchSquare
              ? "min-h-0 flex-1 px-2 pb-2"
              : squareDaysLarge
                ? "mx-1 min-h-0 flex-1 px-0 pb-2"
                : homeLarge
                  ? "mx-3 min-h-0 flex-1 px-2.5 pb-2.5"
                  : homeCompact
                    ? "mx-2 mb-0 min-h-0 flex-1 px-0.5 sm:mx-3"
                    : `mx-2 min-h-0 flex-1 px-0.5 sm:mx-3 ${tight ? "mb-1.5" : "mb-2"}`
          }`}
        >
          <div
            className={`grid ${weekGridClass} text-center ${
              squareDaysLarge
                ? "mb-2.5 gap-2.5"
                : isSquare
                  ? "mb-2 gap-2"
                  : homeLarge
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
                className={`appointment-calendar-weekday font-extrabold ${
                  isModern ? "" : "text-bakery-ink"
                } ${
                  squareDaysLarge
                    ? "py-0.5 text-[18px] sm:text-[19px]"
                    : homeCompact
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
            className={`flex min-h-0 flex-col ${
              stretchSquare
                ? "appointment-calendar-weeks--fill"
                : isSquare
                  ? squareDaysLarge
                    ? "gap-2.5"
                    : "gap-2"
                  : homeLarge
                    ? "flex-1 gap-1.5"
                    : homeCompact
                      ? "min-h-0 flex-1 gap-1"
                      : tight
                        ? "min-h-0 flex-1 gap-1.5"
                        : "min-h-0 flex-1 justify-evenly gap-1 sm:gap-1.5"
            }`}
          >
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className={`grid ${weekGridClass} ${
                  stretchSquare
                    ? `appointment-calendar-week-row--fill ${dayGap}`
                    : isSquare
                      ? dayGap
                      : homeLarge
                        ? `min-h-0 flex-1 ${dayGap}`
                        : homeCompact
                          ? `min-h-0 flex-1 ${dayGap}`
                          : tight
                            ? `min-h-0 flex-1 ${dayGap}`
                            : `max-h-14 min-h-0 flex-1 ${dayGap}`
                }`}
              >
                {week.map((cell, cellIndex) =>
                  cell.day == null || !cell.dateKey ? (
                    <AppointmentCalendarEmptyDay
                      key={`empty-${weekIndex}-${cellIndex}`}
                      weekIndex={weekIndex}
                      cellIndex={cellIndex}
                      compact={tight && !homeCompact && !isSquare}
                      home={homeCompact}
                      homeLarge={homeLarge}
                      square={isSquare}
                      squareLarge={squareDaysLarge}
                      fillHeight={stretchSquare}
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
