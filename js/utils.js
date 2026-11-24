export const $  = (sel, ctx) => (ctx || document).querySelector(sel);
export const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const escapeHTML = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

export const dateKey = (y, m, d) =>
  y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');

export const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}