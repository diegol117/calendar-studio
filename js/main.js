import { state, loadState, saveState } from './state.js';
import { STORAGE_KEY } from './config.js';
import { $, $$, uid, dateKey } from './utils.js';
import { detectLang, applyI18n, t } from './i18n.js';
import { toast } from './toast.js';
import { renderCalendar } from './render.js';
import { populateMonths, populateTags, syncPanel } from './panel.js';
import { openDayModal, initModal, refreshModalI18n } from './modal.js';
import { printCalendar, exportHTML, exportPNG, exportJSON, importJSON } from './export.js';

/* ---------- Indicador de guardado ---------- */
function setSaveIndicator(name) {
  const el = $('#save-indicator');
  if (!el) return;
  el.dataset.state = name;
  el.textContent = name === 'saving' ? t('saving', state.lang) : t('saved', state.lang);
}

/* ---------- Refrescar toda la UI (idioma, import, etc.) ---------- */
function refreshAllUI() {
  applyI18n(state.lang);
  populateMonths();
  populateTags();
  syncPanel();
  renderCalendar();
  refreshModalI18n();
  setSaveIndicator($('#save-indicator')?.dataset.state || 'saved');
}

/* ---------- Acciones de ejemplo / limpiar ---------- */
function loadExample() {
  const examples = state.lang === 'en'
    ? [
        { day: 5,  title: 'Team meeting',      tag: 'work',      note: 'Room 3A · 10:00' },
        { day: 12, title: 'Project deadline',  tag: 'important', note: 'Acme client' },
        { day: 18, title: "Ana's birthday",    tag: 'personal' },
        { day: 22, title: 'Client call',       tag: 'work' },
        { day: 22, title: 'Send proposal',     tag: 'reminder' },
        { day: 28, title: 'Movie + dinner',    tag: 'leisure',   note: 'With Marta' }
      ]
    : [
        { day: 5,  title: 'Reunión de equipo',   tag: 'work',      note: 'Sala 3A · 10:00' },
        { day: 12, title: 'Entrega de proyecto', tag: 'important', note: 'Cliente Acme' },
        { day: 18, title: 'Cumpleaños de Ana',   tag: 'personal' },
        { day: 22, title: 'Llamada con cliente', tag: 'work' },
        { day: 22, title: 'Enviar propuesta',    tag: 'reminder' },
        { day: 28, title: 'Cine + cena',         tag: 'leisure',   note: 'Con Marta' }
      ];

  state.events = {};
  examples.forEach((item) => {
    const k = dateKey(state.year, state.month, item.day);
    if (!state.events[k]) state.events[k] = [];
    state.events[k].push({ id: uid(), title: item.title, tag: item.tag, note: item.note || '' });
  });

  state.title = t('defaultTitle', state.lang);
  state.subtitle = t('defaultSubtitle', state.lang);
  state.footer = state.lang === 'en' ? 'Internal document' : 'Documento interno';

  syncPanel();
  saveState();
  renderCalendar();
  toast(t('exampleLoaded', state.lang));
}

function clearAll() {
  if (!confirm(t('confirmClearAll', state.lang))) return;
  state.events = {};
  state.title = t('defaultTitle', state.lang);
  state.subtitle = t('defaultSubtitle', state.lang);
  state.footer = '';
  syncPanel();
  saveState();
  renderCalendar();
  toast(t('allCleared', state.lang));
}

/* ---------- Bindings ---------- */
function bind() {
  // Config panel
  $('#cfg-month').addEventListener('change', (e) => {
    state.month = parseInt(e.target.value, 10); saveState(); renderCalendar();
  });
  $('#cfg-year').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 1900 && v <= 2200) { state.year = v; saveState(); renderCalendar(); }
  });
  $('#cfg-monthcount').addEventListener('change', (e) => {
    state.monthCount = parseInt(e.target.value, 10); saveState(); renderCalendar();
  });
  $('#cfg-weekstart').addEventListener('change', (e) => {
    state.weekStart = e.target.value; saveState(); renderCalendar();
  });
  ['title', 'subtitle', 'footer'].forEach((k) => {
    const el = $('#cfg-' + k);
    if (el) el.addEventListener('input', () => {
      state[k] = el.value; saveState(); renderCalendar();
    });
  });

  // Orientación
  $$('#orientation-seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.orientation = btn.dataset.orientation;
      syncPanel();
      saveState();
    });
  });

  // Idioma
  $$('#lang-seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.lang === btn.dataset.lang) return;
      state.lang = btn.dataset.lang;
      saveState();
      refreshAllUI();
    });
  });

  // Toggle panel
  $('#btn-toggle-config').addEventListener('click', (e) => {
    const panel = $('#config-panel');
    const btn = e.currentTarget;
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? '' : 'none';
    btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    if (window.innerWidth > 1080) {
      document.querySelector('.layout').style.gridTemplateColumns = isHidden ? '344px minmax(0, 1fr)' : '1fr';
    }
  });

  // Acciones
  $('#btn-example').addEventListener('click', loadExample);
  $('#btn-clear').addEventListener('click', clearAll);
  $('#btn-export-html').addEventListener('click', exportHTML);
  $('#btn-export-png').addEventListener('click', exportPNG);
  $('#btn-print').addEventListener('click', printCalendar);
  $('#btn-print-panel').addEventListener('click', printCalendar);
  $('#btn-export-json').addEventListener('click', exportJSON);
  $('#btn-import-json').addEventListener('click', () => $('#file-import').click());
  $('#file-import').addEventListener('change', (e) => importJSON(e.target.files[0]));

  // Abrir modal al hacer click en un día
  $('#calendar-root').addEventListener('click', (e) => {
    const cell = e.target.closest('button.day[data-date]');
    if (cell) openDayModal(cell.dataset.date);
  });

  // Eventos de estado
  document.addEventListener('state:saving', () => setSaveIndicator('saving'));
  document.addEventListener('state:saved', () => setSaveIndicator('saved'));
  document.addEventListener('state:imported', () => {
    refreshAllUI();
    saveState();
  });
}

/* ---------- Init ---------- */
function init() {
  let fresh = true;
  try { fresh = !localStorage.getItem(STORAGE_KEY); } catch { fresh = true; }

  loadState();

  if (fresh) {
    state.lang = detectLang();
    state.title = t('defaultTitle', state.lang);
    state.subtitle = t('defaultSubtitle', state.lang);
  }

  applyI18n(state.lang);
  populateMonths();
  populateTags();
  syncPanel();
  renderCalendar();
  initModal();
  bind();
  setSaveIndicator('saved');

  if (window.innerWidth > 1080 && $('#config-panel').style.display === 'none') {
    document.querySelector('.layout').style.gridTemplateColumns = '1fr';
  }
}

document.addEventListener('DOMContentLoaded', init);