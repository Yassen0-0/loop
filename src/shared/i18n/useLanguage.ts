import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from './i18n';

export function useLanguage() {
  const { i18n } = useTranslation();
  const language = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const isRTL = language === 'ar';

  useEffect(() => {
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
    }
  }, [isRTL]);

  return {
    isRTL,
    language: language as AppLanguage,
  };
}
