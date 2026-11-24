import { state, saveState } from './state.js';
import { TAGS } from './config.js';
import { $, $$, uid, escapeHTML, parseDateKey } from './utils.js';
import { t, tagLabel, getMonths } from './i18n.js';
import { renderCalendar } from './render.js';
import { toast } from './toast.js';
import { printCalendar, exportHTML } from './export.js';

let currentDateKey = null;

export function initModal() {
  $$('#day-modal [data-close]').forEach((el) => el.addEventListener('click', closeDayModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#day-modal').hidden) closeDayModal();
  });

  $('#event-form').addEventListener('submit', addEvent);

  $('#ev-cancel').addEventListener('click', () => {
    $('#event-form').reset();
    $('#ev-tag').value = TAGS[0].id;
    $('#event-form-title').textContent = t('newEvent', state.lang);
    $('#ev-cancel').hidden = true;
  });

  $('#event-list').addEventListener('click', (e) => {
    const del = e.target.closest('[data-delete]');
    if (del) deleteEvent(del.dataset.delete);
  });

  $('#day-clear').addEventListener('click', clearDay);
  $('#btn-print-modal').addEventListener('click', printCalendar);
  $('#btn-export-modal').addEventListener('click', exportHTML);
}

export function openDayModal(dateKeyStr) {
  currentDateKey = dateKeyStr;
  $('#day-modal-title').textContent = formatDayTitle(dateKeyStr);

  $('#event-form').reset();
  $('#ev-tag').value = TAGS[0].id;
  $('#event-form-title').textContent = t('newEvent', state.lang);
  $('#ev-cancel').hidden = true;

  renderEventList();
  $('#day-modal').hidden = false;
  setTimeout(() => $('#ev-title').focus(), 60);
}

export function closeDayModal() {
  $('#day-modal').hidden = true;
  currentDateKey = null;
}

export function refreshModalI18n() {
  if (!currentDateKey) return;
  $('#day-modal-title').textContent = formatDayTitle(currentDateKey);
  renderEventList();
}

function formatDayTitle(key) {
  const date = parseDateKey(key);
  const months = getMonths(state.lang);
  return state.lang === 'en'
    ? months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
    : date.getDate() + ' de ' + months[date.getMonth()] + ' de ' + date.getFullYear();
}

function renderEventList() {
  const list = $('#event-list');
  if (!list) return;
  const items = (state.events[currentDateKey] || []);
  list.innerHTML = items.map((ev) => {
    const tag = TAGS.find((tg) => tg.id === ev.tag) || TAGS[0];
    return (
      '<li data-id="' + ev.id + '" style="--tag:' + tag.color + '">' +
        '<div class="event-list__content">' +
          '<p class="event-list__title">' + escapeHTML(ev.title || t('quickNote', state.lang)) + '</p>' +
          (ev.note ? '<p class="event-list__note">' + escapeHTML(ev.note) + '</p>' : '') +
          '<p class="event-list__note" style="color:' + tag.color + ';font-weight:600;margin-top:4px">' + escapeHTML(tagLabel(tag, state.lang)) + '</p>' +
        '</div>' +
        '<button type="button" class="event-list__delete" data-delete="' + ev.id + '" aria-label="Eliminar">' +
          '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px">' +
            '<path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7"/>' +
            '<path d="M6.5 7 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9L17.5 7"/>' +
          '</svg>' +
        '</button>' +
      '</li>'
    );
  }).join('');
}

function addEvent(e) {
  e.preventDefault();
  if (!currentDateKey) return;
  const title = $('#ev-title').value.trim();
  const note = $('#ev-note').value.trim();

  if (!title && !note) {
    $('#ev-title').focus();
    toast(t('emptyFields', state.lang));
    return;
  }

  const tag = $('#ev-tag').value || TAGS[0].id;
  if (!state.events[currentDateKey]) state.events[currentDateKey] = [];
  state.events[currentDateKey].push({ id: uid(), title, note, tag });

  saveState();
  renderCalendar();
  renderEventList();

  $('#event-form').reset();
  $('#ev-tag').value = tag;
  $('#ev-title').focus();
  toast(t('savedEvent', state.lang));
}

function deleteEvent(id) {
  if (!currentDateKey || !state.events[currentDateKey]) return;
  state.events[currentDateKey] = state.events[currentDateKey].filter((ev) => ev.id !== id);
  if (!state.events[currentDateKey].length) delete state.events[currentDateKey];
  saveState();
  renderCalendar();
  renderEventList();
  toast(t('deleted', state.lang));
}

function clearDay() {
  if (!currentDateKey) return;
  if (!state.events[currentDateKey] || !state.events[currentDateKey].length) {
    toast(t('dayAlreadyEmpty', state.lang));
    return;
  }
  if (!confirm(t('confirmClearDay', state.lang))) return;
  delete state.events[currentDateKey];
  saveState();
  renderCalendar();
  renderEventList();
  toast(t('dayCleared', state.lang));
}