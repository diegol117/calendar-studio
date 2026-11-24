import { STORAGE_KEY } from './config.js';

const now = new Date();

export const state = {
  lang: 'es',
  month: now.getMonth(),
  year: now.getFullYear(),
  monthCount: 1,
  weekStart: 'monday',
  title: '',
  subtitle: '',
  footer: '',
  orientation: 'portrait',
  printTheme: 'white',   // 'white' | 'black'
  events: {}
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      Object.keys(state).forEach((k) => {
        if (saved[k] !== undefined) state[k] = saved[k];
      });
    }
  } catch { /* ignore */ }
}

let saveTimer = null;

/**
 * Guarda el estado y emite eventos `state:saving` / `state:saved`
 * para que la UI (main.js) actualice el indicador.
 */
export function saveState() {
  document.dispatchEvent(new CustomEvent('state:saving'));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
    document.dispatchEvent(new CustomEvent('state:saved'));
  }, 220);
}