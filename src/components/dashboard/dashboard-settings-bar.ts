/** Shared rectangle style for all settings tiles (account, link, logout, delete). */
export const DASHBOARD_SETTINGS_TILE =
  "overflow-hidden rounded-[22px] border-[1.2px] bg-bakery-square bakery-panel-shadow";

/** Single inner cream tile inside #E6D5B8 settings rows */
export const DASHBOARD_SETTINGS_TILE_INNER =
  "rounded-[14px] border border-[rgba(245,237,224,0.9)] bg-[#F2EBE0] shadow-[0_1px_4px_rgba(58,47,38,0.05)]";

/** Fixed-height action controls so logout / delete match link rows */
export const DASHBOARD_SETTINGS_ACTION =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-[12px]";

/** @deprecated Use DASHBOARD_SETTINGS_TILE — kept for gradual migration */
export const DASHBOARD_SETTINGS_BAR = DASHBOARD_SETTINGS_TILE;

/** @deprecated Use DashboardSettingsTileRow */
export const DASHBOARD_SETTINGS_BAR_INNER =
  "flex min-h-[4.5rem] flex-col items-stretch justify-center gap-3 px-3 py-3.5 sm:flex-row sm:items-center";
