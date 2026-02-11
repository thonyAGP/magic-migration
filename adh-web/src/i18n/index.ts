import { fr } from './fr';
import { en } from './en';

export type Locale = 'fr' | 'en';
export type Translations = typeof fr;

const translations: Record<Locale, Translations> = { fr, en };

let currentLocale: Locale = 'fr';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(path: string): string {
  const keys = path.split('.');
  let result: unknown = translations[currentLocale];
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof result === 'string' ? result : path;
}

export { fr, en };
