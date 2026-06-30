import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { setAppLanguage } from '../../shared/i18n/i18n';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { useAppPreferences } from '../../shared/preferences/AppPreferencesProvider';
import { useAppTheme } from '../../shared/theme/ThemeProvider';
import type { ThemeMode } from '../../shared/theme/theme';

const themeOptions: (ThemeMode | 'system')[] = ['system', 'dark', 'light'];
const languageOptions = ['en', 'ar'] as const;

export function SettingsScreen() {
  const { t } = useTranslation();
  const { isRTL, language } = useLanguage();
  const { preference, setPreference, theme } = useAppTheme();
  const preferences = useAppPreferences();
  const [profileName, setProfileName] = useState(preferences.profileName);
  const [phone, setPhone] = useState(preferences.phone);
  const [country, setCountry] = useState(preferences.region.country);
  const [city, setCity] = useState(preferences.region.city);
  const [pin, setPin] = useState('');
  const initials = profileName.trim().slice(0, 2).toUpperCase() || 'LO';

  function saveProfile() {
    preferences.updateProfile({ phone, profileName });
  }

  function saveRegion() {
    preferences.updateRegion({ city, country });
  }

  function savePin() {
    if (pin.length === 4) {
      preferences.enableLock(pin);
      setPin('');
    }
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            { color: theme.colors.text },
            isRTL && styles.alignRight,
          ]}
        >
          {t('settings.title')}
        </Text>

        <BlurView
          intensity={theme.mode === 'dark' ? 24 : 48}
          tint={theme.mode}
          style={[
            styles.panel,
            {
              backgroundColor: theme.colors.glass,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={[styles.profileRow, isRTL && styles.rowReverse]}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.primarySoft },
              ]}
            >
              <Text
                style={[styles.avatarText, { color: theme.colors.primary }]}
              >
                {initials}
              </Text>
            </View>
            <View style={styles.profileText}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.text },
                  isRTL && styles.alignRight,
                ]}
              >
                {t('settings.profile')}
              </Text>
              <Text
                style={[
                  styles.sectionCopy,
                  { color: theme.colors.muted },
                  isRTL && styles.alignRight,
                ]}
              >
                {t('settings.profileCopy')}
              </Text>
            </View>
          </View>

          <TextInput
            value={profileName}
            onChangeText={setProfileName}
            placeholder={t('settings.namePlaceholder')}
            placeholderTextColor={theme.colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.glassStrong,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          />
          <TextInput
            value={phone}
            keyboardType="phone-pad"
            onChangeText={setPhone}
            placeholder={t('settings.phonePlaceholder')}
            placeholderTextColor={theme.colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.glassStrong,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          />
          <ActionButton
            label={t('settings.saveProfile')}
            onPress={saveProfile}
          />
        </BlurView>

        <SettingsGroup title={t('settings.appearance')}>
          <OptionRow
            options={themeOptions.map((option) => ({
              label: t(`settings.theme.${option}`),
              value: option,
            }))}
            value={preference}
            onChange={(value) => setPreference(value as ThemeMode | 'system')}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings.language')}>
          <OptionRow
            options={languageOptions.map((option) => ({
              label: t(`settings.languages.${option}`),
              value: option,
            }))}
            value={language}
            onChange={(value) => void setAppLanguage(value as 'ar' | 'en')}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings.security')}>
          <View style={[styles.lockRow, isRTL && styles.rowReverse]}>
            <Ionicons
              name={preferences.isLockEnabled ? 'lock-closed' : 'lock-open'}
              size={22}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.lockCopy,
                { color: theme.colors.muted },
                isRTL && styles.alignRight,
              ]}
            >
              {preferences.isLockEnabled
                ? t('settings.lockEnabled')
                : t('settings.lockDisabled')}
            </Text>
          </View>
          <TextInput
            value={pin}
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={(value) =>
              setPin(value.replace(/\D/g, '').slice(0, 4))
            }
            placeholder={t('settings.pinPlaceholder')}
            placeholderTextColor={theme.colors.muted}
            secureTextEntry
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.glassStrong,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          />
          <View style={[styles.actionRow, isRTL && styles.rowReverse]}>
            <ActionButton
              disabled={pin.length !== 4}
              label={t('settings.enablePin')}
              onPress={savePin}
            />
            <ActionButton
              tone="quiet"
              label={t('settings.disablePin')}
              onPress={preferences.disableLock}
            />
          </View>
          <ActionButton
            tone="quiet"
            label={t('settings.lockNow')}
            onPress={preferences.lock}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings.region')}>
          <Text
            style={[
              styles.sectionCopy,
              { color: theme.colors.muted },
              isRTL && styles.alignRight,
            ]}
          >
            {t('settings.regionCopy')}
          </Text>
          <TextInput
            value={country}
            onChangeText={setCountry}
            placeholder={t('settings.countryPlaceholder')}
            placeholderTextColor={theme.colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.glassStrong,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          />
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t('settings.cityPlaceholder')}
            placeholderTextColor={theme.colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.glassStrong,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          />
          <ActionButton label={t('settings.saveRegion')} onPress={saveRegion} />
        </SettingsGroup>

        <SettingsGroup title={t('settings.onboarding')}>
          <ActionButton
            tone="quiet"
            label={t('settings.showWelcome')}
            onPress={preferences.resetWelcome}
          />
        </SettingsGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const { theme } = useAppTheme();
  const { isRTL } = useLanguage();

  return (
    <BlurView
      intensity={theme.mode === 'dark' ? 20 : 42}
      tint={theme.mode}
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.glass,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.text },
          isRTL && styles.alignRight,
        ]}
      >
        {title}
      </Text>
      {children}
    </BlurView>
  );
}

function OptionRow({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  const { theme } = useAppTheme();
  const { isRTL } = useLanguage();

  return (
    <View style={[styles.optionRow, isRTL && styles.rowReverse]}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            style={[
              styles.option,
              {
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.primarySoft,
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: isSelected ? theme.colors.surface : theme.colors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ActionButton({
  disabled,
  label,
  onPress,
  tone = 'primary',
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'quiet';
}) {
  const { theme } = useAppTheme();
  const isPrimary = tone === 'primary';

  return (
    <Pressable
      disabled={disabled}
      style={[
        styles.actionButton,
        {
          backgroundColor:
            isPrimary && !disabled
              ? theme.colors.primary
              : theme.colors.primarySoft,
          borderColor: theme.colors.border,
          opacity: disabled ? 0.58 : 1,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.actionText,
          {
            color:
              isPrimary && !disabled ? theme.colors.surface : theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  alignRight: {
    textAlign: 'right',
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '800',
  },
  content: {
    gap: 12,
    paddingBottom: 132,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '700',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  lockCopy: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  lockRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    overflow: 'hidden',
    padding: 14,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  profileText: {
    flex: 1,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  screen: {
    flex: 1,
  },
  sectionCopy: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 4,
  },
});
