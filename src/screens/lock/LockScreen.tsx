import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAppPreferences } from '../../shared/preferences/AppPreferencesProvider';
import { useAppTheme } from '../../shared/theme/ThemeProvider';

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export function LockScreen() {
  const { t } = useTranslation();
  const { unlock } = useAppPreferences();
  const { theme } = useAppTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const isDark = theme.mode === 'dark';

  function pressDigit(digit: string) {
    const nextPin = `${pin}${digit}`.slice(0, 4);
    setPin(nextPin);
    setError('');

    if (nextPin.length === 4 && !unlock(nextPin)) {
      setError(t('lock.error'));
      setPin('');
    }
  }

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#070A10', '#0B1018', '#070A10']
          : ['#F3F7FC', '#FBFDFF', '#EAF2FF']
      }
      style={styles.gradient}
    >
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Ionicons name="lock-closed" size={34} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('lock.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
            {t('lock.subtitle')}
          </Text>
        </View>

        <View style={styles.dots}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    pin.length > index
                      ? theme.colors.primary
                      : theme.colors.primarySoft,
                  borderColor: theme.colors.border,
                },
              ]}
            />
          ))}
        </View>

        {error ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}

        <View style={styles.keypad}>
          {digits.map((digit) => (
            <Pressable
              key={digit}
              style={[
                styles.key,
                {
                  backgroundColor: theme.colors.glassStrong,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => pressDigit(digit)}
            >
              <Text style={[styles.keyText, { color: theme.colors.text }]}>
                {digit}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[
              styles.key,
              {
                backgroundColor: theme.colors.primarySoft,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setPin(pin.slice(0, -1))}
          >
            <Ionicons
              name="backspace-outline"
              size={24}
              color={theme.colors.text}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 8,
    borderWidth: 1,
    height: 14,
    width: 14,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 28,
  },
  error: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 94,
    paddingHorizontal: 28,
  },
  key: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  keypad: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
    justifyContent: 'center',
    marginTop: 44,
    maxWidth: 230,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '800',
  },
  screen: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 18,
  },
});
