//tailwind
export const SCREEN_BREAK_POINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
};

export const zIndex = {
  slider: 1,
  header: 10,
  actionButton: 50,
  menuDropdown: 100,
  menuDropdownOverlay: 98,
  bottomSheet: 150,
  bottomSheetOverlay: 148,
  modal: 200,
  modalOverlay: 198,
  tooltip: 250,
  tooltipOverlay: 248,
  toast: 300,
  toastOverlay: 398,
};
export const theme = {
  zIndex,
  breakpoint: SCREEN_BREAK_POINTS,
};
export type Theme = typeof theme;
