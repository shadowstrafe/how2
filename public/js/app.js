let themeSetting;

const THEMES = {
  'light-theme': {
    cls: 'theme-light',
    hljs: '/css/highlightjs/solarized-light.css'
  },
  'dark-theme': {
    cls: 'theme-dark',
    hljs: '/css/highlightjs/solarized-dark.css'
  }
};

try {
  var userThemeSetting = window.localStorage.getItem('theme');
  if (userThemeSetting in THEMES) {
    themeSetting = THEMES[userThemeSetting];
  } else {
    themeSetting = THEMES['light-theme'];
  }
} catch (e) {
  console.warn('Unable to retrieve user settings from localStorage, falling back to defaults.');
  themeSetting = THEMES['light-theme'];
}

function themeSwap (theme) {
  $('html').attr('class', '').addClass(theme.cls);
  $('#hljs-stylesheet').attr('href', theme.hljs);
}

$(document).ready(function () {
  themeSwap(themeSetting);
});
