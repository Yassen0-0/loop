import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../shared/i18n/i18n';
import { LockScreen } from '../screens/lock/LockScreen';
import { WelcomeScreen } from '../screens/welcome/WelcomeScreen';
import { AppNavigator } from '../navigation/AppNavigator';
import {
  AppPreferencesProvider,
  useAppPreferences,
} from '../shared/preferences/AppPreferencesProvider';
import { AppThemeProvider, useAppTheme } from '../shared/theme/ThemeProvider';

export function Root() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <AppPreferencesProvider>
            <ThemedStatusBar />
            <AppEntry />
          </AppPreferencesProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppEntry() {
  const { hasCompletedWelcome, isLockEnabled, isUnlocked } =
    useAppPreferences();

  if (!hasCompletedWelcome) {
    return <WelcomeScreen />;
  }

  if (isLockEnabled && !isUnlocked) {
    return <LockScreen />;
  }

  return <AppNavigator />;
}

function ThemedStatusBar() {
  const { theme } = useAppTheme();

  return <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
