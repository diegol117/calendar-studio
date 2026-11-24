// js/export.js
import { state } from './state.js';
import { t } from './i18n.js';
import { escapeHTML, downloadBlob } from './utils.js';
import { toast } from './toast.js';
import { getPrintPageCSS } from './panel.js';

export function printCalendar() { window.print(); }

/* ---------- CSS cacheado para exportaciones ---------- */
let _cssCache = null;

async function loadCalendarCSS() {
  if (_cssCache !== null) return _cssCache;

  // 1) fetch (funciona con HTTP/HTTPS)
  try {
    const [a, b] = await Promise.all([
      fetch('css/styles.css').then((r) => { if (!r.ok) throw new Error(); return r.text(); }),
      fetch('css/calendar.css').then((r) => { if (!r.ok) throw new Error(); return r.text(); }),
    ]);
    _cssCache = a + '\n' + b;
    return _cssCache;
  } catch (err) {
    console.warn('[export] fetch de CSS falló, probando styleSheets:', err);
  }

  // 2) Fallback: leer de document.styleSheets (funciona con file:// para hojas same-origin)
  const parts = [];
  for (const sheet of document.styleSheets) {
    const href = sheet.href || '';
    if (href.includes('fonts.googleapis')) continue;
    try {
      for (const rule of sheet.cssRules) parts.push(rule.cssText);
    } catch {
      if (href) {
        try { parts.push(await fetch(href).then((r) => r.text())); } catch { /* skip */ }
      }
    }
  }
  _cssCache = parts.join('\n');
  return _cssCache;
}

const absUrl = (p) => new URL(p, window.location.href).href;

/* ---------- Export HTML ---------- */
export async function exportHTML() {
  const calendarEl = document.querySelector('#calendar-root .calendar');
  if (!calendarEl) { toast(t('htmlError', state.lang)); return; }

  const css = await loadCalendarCSS();
  const accent = '#6366f1';

  const clone = calendarEl.cloneNode(true);
  clone.querySelectorAll('button.day').forEach((btn) => {
    const div = document.createElement('div');
    div.className = btn.className;
    div.innerHTML = btn.innerHTML;
    btn.replaceWith(div);
  });

  // CSS de impresión (respeta orientación + tema blanco/negro)
  const printCSS = getPrintPageCSS();

  // Si el CSS se pudo leer, se INLINEA (autocontenido).
  // Si no, se referencian las hojas por URL absoluta (fallback).
  const styleBlock = css
    ? '<style>\n' + css + '\n' + printCSS + '\n</style>'
    : '<link rel="stylesheet" href="' + absUrl('css/styles.css') + '">\n' +
      '<link rel="stylesheet" href="' + absUrl('css/calendar.css') + '">\n' +
      '<style>\n' + printCSS + '\n</style>';

  const doc =
    '<!DOCTYPE html>\n<html lang="' + state.lang + '">\n<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>' + escapeHTML(state.title || t('calendarFallback', state.lang)) + '</title>\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">\n' +
    styleBlock + '\n' +
    '<style>\n' +
    'body{margin:0;padding:40px 20px;background:#07080c;display:flex;justify-content:center;align-items:flex-start;font-family:"Inter",system-ui,sans-serif;min-height:100vh}\n' +
    ':root{--accent:' + accent + '}\n' +
    '.calendar{--accent:' + accent + ';margin:0 auto}\n' +
    '</style>\n</head>\n<body>\n' + clone.outerHTML + '\n</body>\n</html>';

  const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, 'calendario-' + state.year + '-' + String(state.month + 1).padStart(2, '0') + '.html');
  toast(t('htmlExported', state.lang));
}

/* ---------- Export PNG (carga dinámica desde CDN ESM real) ---------- */
const CDN_ESM = [
  'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm',
  'https://esm.sh/html-to-image@1.11.11',
  'https://cdn.skypack.dev/html-to-image@1.11.11',
];

let _toBlobPromise = null;
async function getToBlob() {
  if (_toBlobPromise) return _toBlobPromise;
  _toBlobPromise = (async () => {
    for (const url of CDN_ESM) {
      try {
        const mod = await import(/* @vite-ignore */ url);
        const fn = mod.toBlob || (mod.default && mod.default.toBlob);
        if (typeof fn === 'function') return fn;
      } catch (err) {
        console.warn('[exportPNG] CDN falló:', url, err);
      }
    }
    throw new Error('No se pudo cargar html-to-image desde ninguna CDN');
  })();
  return _toBlobPromise;
}

export async function exportPNG() {
  const calendarEl = document.querySelector('#calendar-root .calendar');
  if (!calendarEl) { toast(t('pngError', state.lang)); return; }

  let toBlob;
  try {
    toBlob = await getToBlob();
  } catch (err) {
    console.error('[exportPNG]', err);
    toast(t('pngError', state.lang));
    return;
  }

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
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);

    const months = clone.querySelectorAll('.month');
    const targets = months.length > 1 ? Array.from(months) : [clone];

    for (let i = 0; i < targets.length; i++) {
      const blob = await toBlob(targets[i], {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
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

/* ---------- Export / Import JSON (sin cambios) ---------- */
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
      Object.keys(state).forEach((k) => { if (data[k] !== undefined) state[k] = data[k]; });
      document.dispatchEvent(new CustomEvent('state:imported'));
      toast(t('jsonImported', state.lang));
    } catch { toast(t('jsonInvalid', state.lang)); }
  };
  reader.readAsText(file);
}