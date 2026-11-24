import { state } from './state.js';
import { TAGS } from './config.js';
import { $, $$ } from './utils.js';
import { t, tagLabel, getMonths } from './i18n.js';

export function populateMonths() {
  const sel = $('#cfg-month');
  if (!sel) return;
  const months = getMonths(state.lang);
  sel.innerHTML = months.map((m, i) => '<option value="' + i + '">' + m + '</option>').join('');
}

export function populateTags() {
  const sel = $('#ev-tag');
  if (!sel) return;
  sel.innerHTML = TAGS
    .map((tg) => '<option value="' + tg.id + '">' + tagLabel(tg, state.lang) + '</option>')
    .join('');
}

export function syncPanel() {
  const setVal = (id, v) => { const el = $('#' + id); if (el) el.value = v; };
  setVal('cfg-month', state.month);
  setVal('cfg-year', state.year);
  setVal('cfg-monthcount', state.monthCount);
  setVal('cfg-weekstart', state.weekStart);
  setVal('cfg-title', state.title);
  setVal('cfg-subtitle', state.subtitle);
  setVal('cfg-footer', state.footer);

  $$('#orientation-seg button').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.orientation === state.orientation);
  });

  $$('#print-theme-seg button').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.theme === state.printTheme);
  });

  updatePrintPage();
}

export function updatePrintPage() {
  const style = $('#print-page-style');
  if (style) style.textContent = getPrintPageCSS();
}

/**
 * Devuelve el CSS completo de @page + @media print, teniendo en cuenta
 * la orientación y el tema de impresión (blanco o negro).
 * Se usa en el indicador #print-page-style (app en vivo) y en exportHTML().
 *
 *  - black: la hoja entera se pinta con el mismo color del calendario
 *           (incluido el margen de la @page, vía box-shadow).
 *  - white: hoja blanca, calendario en gris y texto negro.
 */
export function getPrintPageCSS() {
  const size  = 'A4 ' + state.orientation;
  const black = state.printTheme === 'black';

  let css = '';

  if (black) {
    // 1. Quitamos el margen de la página para que el color llegue a los bordes físicos
    css += `@page{size:${size};margin:0}`;
    css += `@media print{`;
    // 2. Pintamos toda la hoja de negro y le damos el margen visual con padding
    css += `html,body{background:#07080c !important;color:#fff !important;margin:0 !important;padding:0 !important;width:100% !important;height:100% !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}`;
    css += `body{padding:12mm !important;box-sizing:border-box !important}`;

    // 3. Hacemos transparentes todos los contenedores
    css += `.layout,.stage,#calendar-root{background:transparent !important;margin:0 !important;padding:0 !important;display:block !important;width:100% !important;max-width:100% !important}`;

    // 4. EL TRUCO: Calendario transparente, sin bordes, sin sombras y a todo el ancho
    css += `.calendar{background:transparent !important;border:none !important;box-shadow:none !important;border-radius:0 !important;width:100% !important;max-width:100% !important;padding:0 !important}`;

    // 5. Reglas de paginación
    css += `.months-grid{display:block !important}`;
    css += `.month{break-inside:avoid;page-break-inside:avoid}`;
    css += `.month+.month{break-before:page;page-break-before:always}`;
  } else {
    // Hoja blanca + calendario gris con letras negras (monocromo).
    css += `@page{size:${size};margin:12mm}`;
    css += `@media print{`;
    css += `.calendar{-webkit-print-color-adjust:exact;print-color-adjust:exact}`;
    css += `.months-grid{display:block !important}`;
    css += `.month{break-inside:avoid;page-break-inside:avoid}`;
    css += `.month+.month{break-before:page;page-break-before:always}`;

    css += `html,body{background:#ffffff !important;color:#000 !important;padding:0 !important;margin:0 !important}`;
    css += `.calendar{background:#d1d5db !important;color:#000 !important;filter:grayscale(1)}`;
    css += `.calendar__title,.calendar__subtitle,.calendar__footer,.calendar__badge,.month__title,.weekdays span,.day__num,.day__more,.day__event{color:#000 !important}`;
    css += `.day{background:#f3f4f6 !important;border-color:#9ca3af !important}`;
    css += `.day--empty{background:transparent !important;border-color:transparent !important}`;
    css += `.day--weekend{background:#e5e7eb !important}`;
    css += `.day--today{background:#9ca3af !important}`;
    css += `.calendar__badge{background:#9ca3af !important;color:#000 !important}`;
  }

  css += `}`;
  return css;
}
