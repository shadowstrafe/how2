interface ITheme {
    hljs: string;
    cls: string;
}

interface IThemeCollection {
    [index: string]: ITheme;
}

const THEMES: IThemeCollection = {
  dark: {
    cls: 'theme-dark',
    hljs: 'solarized-dark.css',
  },
  light: {
    cls: 'theme-light',
    hljs: 'solarized-light.css',
  },
};

const DEFAULT_THEME: ITheme = THEMES.light;

export function getTheme(themeName: string): ITheme {
  if (hasTheme(themeName)) {
    return THEMES[themeName];
  } else {
    return DEFAULT_THEME;
  }
}

export function hasTheme(themeName: string): boolean {
  return themeName && themeName in THEMES;
}
