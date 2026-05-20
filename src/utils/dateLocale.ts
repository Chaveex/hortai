import { fr, enUS, es } from 'date-fns/locale';

export function getDateLocale(language: string = 'fr'): any {
  switch (language) {
    case 'en':
      return enUS;
    case 'es':
      return es;
    case 'fr':
    default:
      return fr;
  }
}
