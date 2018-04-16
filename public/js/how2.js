const SHORT_DATE_SETTINGS = {
  jqueryUIDateFormat: 'dd/mm/yy',
  momentDateFormat: 'DD/MM/YYYY',
  momentTimeFormat: 'HH:mm',
  momentDateTimeFormat: 'DD/MM/YYYY, HH:mm',
  momentMonthFormat: 'MM/YYYY'
};

const LONG_DATE_SETTINGS = {
  jqueryUIDateFormat: 'd M yy',
  momentDateFormat: 'D MMM YYYY',
  momentTimeFormat: 'HH:mm',
  momentDateTimeFormat: 'D MMM YYYY, HH:mm',
  momentMonthFormat: 'MMM YYYY'
};

let dateSettings = null;

try {
  var userDateSettings = window.localStorage.getItem('dateSettings');

  switch (userDateSettings) {
    case 'short':
      dateSettings = SHORT_DATE_SETTINGS;
      break;
    case 'long':
    default:
      dateSettings = LONG_DATE_SETTINGS;
      break;
  }
} catch (e) {
  console.warn('Unable to retrieve user settings from localStorage, falling back to long format');
  dateSettings = LONG_DATE_SETTINGS;
}
