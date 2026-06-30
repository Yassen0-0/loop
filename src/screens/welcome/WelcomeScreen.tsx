import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAppPreferences } from '../../shared/preferences/AppPreferencesProvider';
import { useAppTheme } from '../../shared/theme/ThemeProvider';

export function WelcomeScreen() {
  const { t } = useTranslation();
  const { completeWelcome } = useAppPreferences();
  const { theme } = useAppTheme();
  const isDark = theme.mode === 'dark';

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#070A10', '#0D1420', '#070A10']
          : ['#F3F7FC', '#FBFDFF', '#EAF2FF']
      }
      style={styles.gradient}
    >
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <BlurView
            intensity={isDark ? 22 : 44}
            tint={theme.mode}
            style={[
              styles.mark,
              {
                backgroundColor: theme.colors.glassStrong,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={38}
              color={theme.colors.primary}
            />
          </BlurView>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('welcome.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
            {t('welcome.subtitle')}
          </Text>
        </View>

        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={completeWelcome}
        >
          <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
            {t('welcome.start')}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={theme.colors.surface}
          />
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 28,
    minHeight: 52,
    paddingHorizontal: 22,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  gradient: {
    flex: 1,
  },
  mark: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    height: 76,
    justifyContent: 'center',
    marginBottom: 28,
    overflow: 'hidden',
    width: 76,
  },
  screen: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
    marginTop: 10,
    maxWidth: 320,
    textAlign: 'center',
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
