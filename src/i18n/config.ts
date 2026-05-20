import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';

const resources = { fr, en, es };

const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'fr';
const defaultLanguage = ['fr', 'en', 'es'].includes(deviceLanguage) ? deviceLanguage : 'fr';

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });

export default i18next;
