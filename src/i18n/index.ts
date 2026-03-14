import { createContext, useContext } from 'react'
import en from './locales/en'
import pt from './locales/pt'
import es from './locales/es'
import fr from './locales/fr'

export type Locale = 'en' | 'pt' | 'es' | 'fr'

export type Translations = typeof en

export const locales: Record<Locale, { label: string; flag: string }> = {
  en: { label: 'English', flag: 'EN' },
  pt: { label: 'Português', flag: 'PT' },
  es: { label: 'Español', flag: 'ES' },
  fr: { label: 'Français', flag: 'FR' },
}

export const translations: Record<Locale, Translations> = {
  en,
  pt: pt as unknown as Translations,
  es: es as unknown as Translations,
  fr: fr as unknown as Translations,
}

export function detectLocale(): Locale {
  const stored = localStorage.getItem('real-balance-locale')
  if (stored && stored in translations) return stored as Locale

  const browserLangs = navigator.languages || [navigator.language]
  for (const lang of browserLangs) {
    const code = lang.toLowerCase().split('-')[0]
    if (code in translations) return code as Locale
  }

  return 'en'
}

export interface I18nContextValue {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
}

export const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: en,
  setLocale: () => {},
})

export function useI18n() {
  return useContext(I18nContext)
}
