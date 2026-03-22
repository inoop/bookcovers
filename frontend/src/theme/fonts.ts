/**
 * Font face declarations for PRH brand fonts.
 *
 * When the actual font files (Shift, Fort, Futura W01) are available,
 * uncomment and update the src paths below. Until then, the CSS fallback
 * stacks in tokens.ts will be used automatically.
 *
 * To use: import this file in main.tsx to inject the @font-face rules.
 */

const fontFaceCSS = `
/* Shift — Display Serif */
/*
@font-face {
  font-family: 'Shift-Light';
  src: url('/fonts/Shift-Light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Shift-Medium';
  src: url('/fonts/Shift-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Shift-Bold';
  src: url('/fonts/Shift-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
*/

/* Fort — UI Sans */
/*
@font-face {
  font-family: 'Fort-Light';
  src: url('/fonts/Fort-Light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Fort-Medium';
  src: url('/fonts/Fort-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Fort-Bold';
  src: url('/fonts/Fort-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
*/

/* Futura W01 — Utility / Nav Sans */
/*
@font-face {
  font-family: 'Futura W01 Book';
  src: url('/fonts/FuturaW01-Book.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Futura W01 Bold';
  src: url('/fonts/FuturaW01-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
*/
`;

export function injectFontFaces(): void {
  const style = document.createElement('style');
  style.textContent = fontFaceCSS;
  document.head.appendChild(style);
}
