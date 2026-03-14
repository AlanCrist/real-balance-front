import { useState, useMemo, useCallback } from 'react'
import { I18nContext, detectLocale, translations, type Locale } from '.'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('real-balance-locale', newLocale)
    document.documentElement.lang = newLocale
  }, [])

  const value = useMemo(
    () => ({ locale, t: translations[locale], setLocale }),
    [locale, setLocale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
