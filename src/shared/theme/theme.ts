export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  colors: {
    background: string;
    border: string;
    borderStrong: string;
    danger: string;
    glass: string;
    glassStrong: string;
    info: string;
    muted: string;
    mutedLight: string;
    primary: string;
    primarySoft: string;
    shadow: string;
    success: string;
    surface: string;
    text: string;
    warning: string;
  };
};

const blue = '#2563EB';

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#F3F7FC',
    border: 'rgba(37, 99, 235, 0.11)',
    borderStrong: 'rgba(37, 99, 235, 0.22)',
    danger: '#E5484D',
    glass: 'rgba(255, 255, 255, 0.66)',
    glassStrong: 'rgba(255, 255, 255, 0.86)',
    info: blue,
    muted: '#64748B',
    mutedLight: '#94A3B8',
    primary: blue,
    primarySoft: 'rgba(37, 99, 235, 0.10)',
    shadow: 'rgba(15, 23, 42, 0.10)',
    success: '#16A06A',
    surface: '#FDFEFF',
    text: '#111827',
    warning: '#E89558',
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#070A10',
    border: 'rgba(156, 178, 207, 0.13)',
    borderStrong: 'rgba(156, 178, 207, 0.26)',
    danger: '#D9777D',
    glass: 'rgba(14, 19, 28, 0.68)',
    glassStrong: 'rgba(18, 25, 36, 0.86)',
    info: '#9CB2CF',
    muted: '#A8B3C3',
    mutedLight: '#728095',
    primary: '#9CB2CF',
    primarySoft: 'rgba(156, 178, 207, 0.12)',
    shadow: 'rgba(0, 0, 0, 0.36)',
    success: '#78B99A',
    surface: '#111824',
    text: '#F3F6FA',
    warning: '#D7A66F',
  },
};

export const appThemes: Record<ThemeMode, AppTheme> = {
  dark: darkTheme,
  light: lightTheme,
};
