class Theme {
    hljs: string;
    cls: string;
}

interface ThemeCollection {
    [index: string]: Theme;
}

const THEMES: ThemeCollection = {
  'light': {
    cls: 'theme-light',
    hljs: 'solarized-light.css'
  },
  'dark': {
    cls: 'theme-dark',
    hljs: 'solarized-dark.css'
  }
};

const DEFAULT_THEME: Theme = THEMES['light'];

export function getTheme (themeName: string): Theme {
  if (hasTheme(themeName)) {
    return THEMES[themeName];
  } else {
    return DEFAULT_THEME;
  }
}

export function hasTheme(themeName: string): boolean {
  return themeName && themeName in THEMES;
}
