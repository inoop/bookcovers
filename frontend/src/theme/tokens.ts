// Design tokens from PRH-aligned style guide

export const colors = {
  brand: {
    ink: '#000000',
    paper: '#FFFFFF',
    orange: '#FF6600',
    orangeSoft: '#FF6F00',
    blueSlate: '#3C5A75',
    charcoal: '#231F20',
  },
  text: {
    primary: '#000000',
    body: '#464646',
    secondary: '#757575',
    muted: '#999999',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#C2C4C8',
    strong: '#5D5D5D',
  },
  surface: {
    canvas: '#FFFFFF',
    soft: '#F8F8F9',
    softAlt: '#F7F7F7',
    raised: '#F4F4F4',
    inverse: '#231F20',
  },
  action: {
    primary: '#FF6600',
    primaryHover: '#E65C00',
    secondary: '#3C5A75',
    secondaryHover: '#31495F',
  },
  link: {
    default: '#000000',
    accent: '#FF6600',
    utility: '#3C5A75',
    alt: '#007DAC',
  },
  focus: {
    ring: '#007DAC',
  },
  status: {
    success: '#2E6F4E',
    warning: '#A15C00',
    error: '#A62B1F',
    info: '#3C5A75',
  },
} as const;

export const fonts = {
  display: '"Shift-Light", Georgia, "Iowan Old Style", "Times New Roman", serif',
  displayMedium: '"Shift-Medium", Georgia, serif',
  displayBold: '"Shift-Bold", Georgia, serif',
  body: '"Fort-Light", "Helvetica Neue", Helvetica, Arial, sans-serif',
  bodyStrong: '"Fort-Medium", "Helvetica Neue", Helvetica, Arial, sans-serif',
  bodyBold: '"Fort-Bold", "Helvetica Neue", Helvetica, Arial, sans-serif',
  utility: '"Futura W01 Bold", "Avenir Next", Avenir, "Helvetica Neue", Arial, sans-serif',
  utilityBook: '"Futura W01 Book", "Avenir Next", Avenir, "Helvetica Neue", Arial, sans-serif',
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
  11: 80,
  12: 96,
} as const;

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const shadows = {
  none: 'none',
  sm: '0 2px 8px rgba(0,0,0,0.06)',
  md: '0 8px 24px rgba(0,0,0,0.10)',
  sticky: '0 10px 10px -4px rgba(0,0,0,0.4)',
} as const;

export const motion = {
  fast: '120ms',
  base: '180ms',
  slow: '260ms',
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;
