import * as Localization from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from './translations';

export type AppLanguage = 'ar' | 'en';

const supportedLanguages: AppLanguage[] = ['ar', 'en'];
const languagePreferenceKey = 'loop.language.v1';

function getDeviceLanguage(): AppLanguage {
  const storedLanguage = globalThis.localStorage?.getItem(
    languagePreferenceKey,
  );

  if (supportedLanguages.includes(storedLanguage as AppLanguage)) {
    return storedLanguage as AppLanguage;
  }

  const languageCode = Localization.getLocales()[0]?.languageCode;

  return supportedLanguages.includes(languageCode as AppLanguage)
    ? (languageCode as AppLanguage)
    : 'en';
}

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  lng: getDeviceLanguage(),
  resources,
});

export function setAppLanguage(language: AppLanguage) {
  globalThis.localStorage?.setItem(languagePreferenceKey, language);
  return i18n.changeLanguage(language);
}

export { i18n };
