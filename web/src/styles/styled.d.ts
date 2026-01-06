import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryDark: string;
      primaryLight: string;
      secondary: string;
      secondaryDark: string;
      secondaryLight: string;
      success: string;
      successDark: string;
      successLight: string;
      warning: string;
      warningDark: string;
      warningLight: string;
      error: string;
      errorDark: string;
      errorLight: string;
      info: string;
      infoDark: string;
      infoLight: string;
      background: string;
      backgroundSecondary: string;
      backgroundTertiary: string;
      text: string;
      textSecondary: string;
      textLight: string;
      border: string;
      borderDark: string;
      borderLight: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      snug: number;
      normal: number;
      relaxed: number;
      loose: number;
    };
    shadows: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      full: string;
    };
    transitions: {
      fast: string;
      base: string;
      slow: string;
    };
    breakpoints: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  }
}
