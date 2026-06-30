import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { appThemes, type AppTheme, type ThemeMode } from './theme';

type ThemePreference = ThemeMode | 'system';

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themePreferenceKey = 'loop.theme.preference.v1';

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    readThemePreference(),
  );

  function setPreference(nextPreference: ThemePreference) {
    setPreferenceState(nextPreference);
    globalThis.localStorage?.setItem(themePreferenceKey, nextPreference);
  }

  const mode: ThemeMode =
    preference === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      theme: appThemes[mode],
    }),
    [mode, preference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

function readThemePreference(): ThemePreference {
  const preference = globalThis.localStorage?.getItem(themePreferenceKey);

  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return 'system';
}

export function useAppTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used inside AppThemeProvider.');
  }

  return value;
}
