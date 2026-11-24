export const I18N = {
  es: {
    appTitle: 'Calendario Studio', brand: 'Calendario Studio',
    saved: 'Guardado automáticamente', saving: 'Guardando…',
    settings: 'Configuración', toggleConfigAria: 'Mostrar u ocultar configuración',
    loadExample: 'Cargar ejemplo', clearAll: 'Limpiar todo',
    exportHtml: 'Exportar HTML', printPdf: 'Imprimir / PDF',
    period: 'Periodo', month: 'Mes', year: 'Año',
    consecutiveMonths: 'Meses consecutivos',
    months1: '1 mes', months2: '2 meses', months3: '3 meses (trimestre)',
    weekStartLabel: 'Inicio de semana', monday: 'Lunes', sunday: 'Domingo',
    texts: 'Textos', mainTitle: 'Título principal', subtitle: 'Subtítulo', footerNote: 'Nota al pie',
    printSection: 'Impresión / PDF', orientation: 'Orientación',
    portrait: 'Vertical', landscape: 'Horizontal',
    printSavePdf: 'Imprimir / Guardar PDF',
    printHint: 'Se ocultan los controles y se respeta el tamaño A4 con la orientación elegida. Con varios meses, cada mes ocupa una página.',
    data: 'Datos', exportJson: 'Exportar JSON', importJson: 'Importar JSON',
    dataHint: 'Los datos se guardan solo en este navegador. Exporta un respaldo para no perderlos.',
    dayEvents: 'Eventos del día', newEvent: 'Nuevo evento',
    eventTitleLabel: 'Título de la tarea o nota', eventNoteLabel: 'Descripción (opcional)',
    eventTagLabel: 'Etiqueta de color', saveToCell: 'Guardar en la casilla',
    cancel: 'Cancelar', savePdf: 'Guardar PDF', saveHtml: 'Guardar HTML',
    clearDay: 'Vaciar todos los eventos de este día',
    titlePlaceholder: 'Mi calendario', subtitlePlaceholder: 'Organiza tus días con estilo',
    footerPlaceholder: 'Ej. Documento interno del equipo',
    eventTitlePlaceholder: 'Ej. Reunión de equipo', eventNotePlaceholder: 'Detalles breves…',
    calendarFallback: 'Calendario', defaultTitle: 'Mi calendario',
    defaultSubtitle: 'Organiza tus días con estilo',
    emptyFields: 'Escribe al menos un título o una nota',
    savedEvent: 'Guardado en el calendario', deleted: 'Eliminado',
    dayAlreadyEmpty: 'Este día ya está vacío', dayCleared: 'Día vaciado',
    confirmClearDay: '¿Vaciar todos los eventos de este día?',
    confirmClearAll: '¿Borrar todos los eventos y restablecer los textos?',
    htmlExported: 'HTML exportado correctamente', jsonExported: 'JSON exportado',
    jsonImported: 'Datos importados', jsonInvalid: 'Archivo JSON inválido',
    exampleLoaded: 'Ejemplo cargado', allCleared: 'Todo limpio',
    quickNote: 'Nota rápida', moreEvents: 'más'
  },
  en: {
    appTitle: 'Calendar Studio', brand: 'Calendar Studio',
    saved: 'Autosaved', saving: 'Saving…',
    settings: 'Settings', toggleConfigAria: 'Show or hide settings',
    loadExample: 'Load example', clearAll: 'Clear all',
    exportHtml: 'Export HTML', printPdf: 'Print / PDF',
    period: 'Period', month: 'Month', year: 'Year',
    consecutiveMonths: 'Consecutive months',
    months1: '1 month', months2: '2 months', months3: '3 months (quarter)',
    weekStartLabel: 'Week starts on', monday: 'Monday', sunday: 'Sunday',
    texts: 'Texts', mainTitle: 'Main title', subtitle: 'Subtitle', footerNote: 'Footer note',
    printSection: 'Print / PDF', orientation: 'Orientation',
    portrait: 'Portrait', landscape: 'Landscape',
    printSavePdf: 'Print / Save PDF',
    printHint: 'Controls are hidden and A4 size is kept with the chosen orientation. With several months, each month gets its own page.',
    data: 'Data', exportJson: 'Export JSON', importJson: 'Import JSON',
    dataHint: "Data is stored only in this browser. Export a backup so you don't lose it.",
    dayEvents: 'Events of the day', newEvent: 'New event',
    eventTitleLabel: 'Task or note title', eventNoteLabel: 'Description (optional)',
    eventTagLabel: 'Color label', saveToCell: 'Save to this day',
    cancel: 'Cancel', savePdf: 'Save PDF', saveHtml: 'Save HTML',
    clearDay: 'Clear all events for this day',
    titlePlaceholder: 'My calendar', subtitlePlaceholder: 'Organize your days in style',
    footerPlaceholder: 'E.g. Internal team document',
    eventTitlePlaceholder: 'E.g. Team meeting', eventNotePlaceholder: 'Brief details…',
    calendarFallback: 'Calendar', defaultTitle: 'My calendar',
    defaultSubtitle: 'Organize your days in style',
    emptyFields: 'Write at least a title or a note',
    savedEvent: 'Saved to calendar', deleted: 'Deleted',
    dayAlreadyEmpty: 'This day is already empty', dayCleared: 'Day cleared',
    confirmClearDay: 'Clear all events for this day?',
    confirmClearAll: 'Delete all events and reset texts?',
    htmlExported: 'HTML exported successfully', jsonExported: 'JSON exported',
    jsonImported: 'Data imported', jsonInvalid: 'Invalid JSON file',
    exampleLoaded: 'Example loaded', allCleared: 'All clear',
    quickNote: 'Quick note', moreEvents: 'more'
  }
};

export const MONTHS_I18N = {
  es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December']
};

export const WEEKDAYS = {
  es: {
    monday: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],
    sunday: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  },
  en: {
    monday: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    sunday: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  }
};

export function detectLang() {
  try {
    return String(navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  } catch { return 'es'; }
}

export function t(key, lang = 'es') {
  const dict = I18N[lang] || I18N.es;
  return dict[key] !== undefined ? dict[key] : (I18N.es[key] !== undefined ? I18N.es[key] : key);
}

export function tagLabel(tag, lang = 'es') {
  return (tag.labels && (tag.labels[lang] || tag.labels.es)) || tag.id;
}

export function getMonths(lang = 'es') {
  return MONTHS_I18N[lang] || MONTHS_I18N.es;
}

export function getWeekdays(lang = 'es', weekStart = 'monday') {
  return (WEEKDAYS[lang] || WEEKDAYS.es)[weekStart] || WEEKDAYS.es.monday;
}

export function applyI18n(lang) {
  document.documentElement.lang = lang;
  document.title = t('appTitle', lang);

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n, lang);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder, lang);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria, lang));
  });
  document.querySelectorAll('#lang-seg button').forEach((b) => {
    const active = b.dataset.lang === lang;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}