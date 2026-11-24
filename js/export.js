// js/export.js
import { state } from './state.js';
import { t } from './i18n.js';
import { escapeHTML, downloadBlob } from './utils.js';
import { toast } from './toast.js';
import { toBlob } from 'html-to-image';

export function printCalendar() { window.print(); }

/* ---------- CSS cacheado para exportaciones ---------- */
let _cssCache = null;
async function loadCalendarCSS() {
  if (_cssCache !== null) return _cssCache;
  try {
    const [a, b] = await Promise.all([
      fetch('css/styles.css').then((r) => r.text()),
      fetch('css/calendar.css').then((r) => r.text()),
    ]);
    _cssCache = a + '\n' + b;
  } catch (err) {
    console.error('[export] No se pudo leer el CSS:', err);
    _cssCache = '';
  }
  return _cssCache;
}

/* ---------- Export HTML ---------- */
export async function exportHTML() {
  const calendarEl = document.querySelector('#calendar-root .calendar');
  if (!calendarEl) return;

  const css = await loadCalendarCSS();
  const accent = '#6366f1';

  const clone = calendarEl.cloneNode(true);
  clone.querySelectorAll('button.day').forEach((btn) => {
    const div = document.createElement('div');
    div.className = btn.className;
    div.innerHTML = btn.innerHTML;
    btn.replaceWith(div);
  });

  const printCSS =
    '@page{size:A4 ' + state.orientation + ';margin:12mm}' +
    '@media print{' +
      '.calendar{-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '.months-grid{display:block !important}' +
      '.month{break-inside:avoid;page-break-inside:avoid}' +
      '.month+.month{break-before:page;page-break-before:always}' +
    '}';

  const doc =
    '<!DOCTYPE html>\n<html lang="' + state.lang + '">\n<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>' + escapeHTML(state.title || t('calendarFallback', state.lang)) + '</title>\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">\n' +
    '<style>\n' +
    'body{margin:0;padding:40px 20px;background:#07080c;display:flex;justify-content:center;align-items:flex-start;font-family:"Inter",system-ui,sans-serif;min-height:100vh}\n' +
    ':root{--accent:' + accent + '}\n' +
    css + '\n' +
    '.calendar{--accent:' + accent + '}\n' +
    printCSS + '\n' +
    '</style>\n</head>\n<body>\n' + clone.outerHTML + '\n</body>\n</html>';

  const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, 'calendario-' + state.year + '-' + String(state.month + 1).padStart(2, '0') + '.html');
  toast(t('htmlExported', state.lang));
}

/* ---------- Export PNG ---------- */
export async function exportPNG() {
  const calendarEl = document.querySelector('#calendar-root .calendar');
  if (!calendarEl) return;

  const clone = calendarEl.cloneNode(true);
  clone.querySelectorAll('button.day').forEach((btn) => {
    const div = document.createElement('div');
    div.className = btn.className;
    div.innerHTML = btn.innerHTML;
    btn.replaceWith(div);
  });

  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-100000px;top:0;background:#fff;margin:0;padding:0';
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    await document.fonts.ready;

    const months = clone.querySelectorAll('.month');
    const targets = months.length > 1 ? Array.from(months) : [clone];

    for (let i = 0; i < targets.length; i++) {
      const blob = await toBlob(targets[i], {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        style: { boxShadow: 'none', borderRadius: '0', margin: '0' },
      });
      if (!blob) throw new Error('toBlob devolvió null');

      const suffix = targets.length > 1 ? '-' + (i + 1) : '';
      downloadBlob(
        blob,
        'calendario-' + state.year + '-' + String(state.month + 1).padStart(2, '0') + suffix + '.png'
      );
      await new Promise((r) => setTimeout(r, 150));
    }

    toast(t('pngExported', state.lang));
  } catch (err) {
    console.error('[exportPNG]', err);
    toast(t('pngError', state.lang));
  } finally {
    holder.remove();
  }
}

/* ---------- Export / Import JSON ---------- */
export function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'calendario-backup-' + state.year + '.json');
  toast(t('jsonExported', state.lang));
}

export function importJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      Object.keys(state).forEach((k) => {
        if (data[k] !== undefined) state[k] = data[k];
      });
      document.dispatchEvent(new CustomEvent('state:imported'));
      toast(t('jsonImported', state.lang));
    } catch {
      toast(t('jsonInvalid', state.lang));
    }
  };
  reader.readAsText(file);
}