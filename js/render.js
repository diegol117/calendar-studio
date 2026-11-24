import { state } from './state.js';
import { TAGS } from './config.js';
import { escapeHTML, dateKey } from './utils.js';
import { t, getMonths, getWeekdays } from './i18n.js';

export function renderCalendar() {
  const root = document.getElementById('calendar-root');
  if (!root) return;

  const { year, month, monthCount, weekStart, events, title, subtitle, footer } = state;
  const months = getMonths(state.lang);
  const weekdayLabels = getWeekdays(state.lang, weekStart);

  const today = new Date();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  let monthsHTML = '';
  for (let i = 0; i < monthCount; i++) {
    const m = (month + i) % 12;
    const y = year + Math.floor((month + i) / 12);
    monthsHTML += renderMonth(y, m, weekStart, events, todayKey, weekdayLabels, months);
  }

  const badgeLabel = monthCount === 1
    ? months[month] + ' ' + year
    : months[month] + ' – ' + months[(month + monthCount - 1) % 12] + ' ' + year;

  const headerHTML =
    '<div class="calendar__header">' +
      '<div>' +
        '<h1 class="calendar__title">' + escapeHTML(title || t('calendarFallback', state.lang)) + '</h1>' +
        (subtitle ? '<p class="calendar__subtitle">' + escapeHTML(subtitle) + '</p>' : '') +
      '</div>' +
      '<span class="calendar__badge">' + escapeHTML(badgeLabel) + '</span>' +
    '</div>';

  const footerHTML =
    '<div class="calendar__footer">' +
      '<span>' + (footer ? escapeHTML(footer) : '') + '</span>' +
      '<span><strong>' + escapeHTML(t('brand', state.lang)) + '</strong></span>' +
    '</div>';

  root.innerHTML =
    '<div class="calendar">' +
      headerHTML +
      '<div class="months-grid" data-count="' + monthCount + '">' + monthsHTML + '</div>' +
      footerHTML +
    '</div>';
}

function renderMonth(year, month, weekStart, events, todayKey, weekdayLabels, months) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let startWeekday = firstDay.getDay();
  if (weekStart === 'monday') startWeekday = (startWeekday + 6) % 7;

  let html = '<div class="month">';
  html += '<h3 class="month__title">' + months[month] + ' ' + year + '</h3>';
  html += '<div class="weekdays">' + weekdayLabels.map((d) => '<span>' + d + '</span>').join('') + '</div>';
  html += '<div class="days">';

  for (let i = 0; i < startWeekday; i++) html += '<span class="day day--empty"></span>';

  for (let d = 1; d <= daysInMonth; d++) {
    const dk = dateKey(year, month, d);
    const wd = new Date(year, month, d).getDay();
    const isWeekend = wd === 0 || wd === 6;
    const isToday = dk === todayKey;
    const dayEvents = events[dk] || [];

    const cls = ['day'];
    if (isWeekend) cls.push('day--weekend');
    if (isToday) cls.push('day--today');

    const aria = state.lang === 'en'
      ? 'Add event on ' + months[month] + ' ' + d
      : 'Añadir evento el ' + d + ' de ' + months[month];

    html += '<button type="button" class="' + cls.join(' ') + '" data-date="' + dk + '" aria-label="' + escapeHTML(aria) + '">';
    html += '<span class="day__num">' + d + '</span>';

    if (dayEvents.length > 0) {
      html += '<div class="day__events">';
      dayEvents.slice(0, 3).forEach((ev) => {
        const tag = TAGS.find((tg) => tg.id === ev.tag) || TAGS[0];
        const displayText = ev.title || ev.note || t('quickNote', state.lang);
        const title = escapeHTML(ev.title) + (ev.note ? '\n' + escapeHTML(ev.note) : '');
        html += '<span class="day__event" style="--tag:' + tag.color + '" title="' + title + '">' + escapeHTML(displayText) + '</span>';
      });
      if (dayEvents.length > 3) {
        html += '<span class="day__more">+' + (dayEvents.length - 3) + ' ' + escapeHTML(t('moreEvents', state.lang)) + '</span>';
      }
      html += '</div>';
    }
    html += '</button>';
  }

  const total = startWeekday + daysInMonth;
  const trailing = (7 - (total % 7)) % 7;
  for (let i = 0; i < trailing; i++) html += '<span class="day day--empty"></span>';

  html += '</div></div>';
  return html;
}