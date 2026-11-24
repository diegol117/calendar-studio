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

  updatePrintPage();
}

export function updatePrintPage() {
  const style = $('#print-page-style');
  if (style) style.textContent = '@page{size:A4 ' + state.orientation + ';margin:12mm}';
}