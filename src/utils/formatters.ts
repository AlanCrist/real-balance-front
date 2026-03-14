import type { Locale } from '@/i18n'

const currencyMap: Record<Locale, { currency: string; locale: string }> = {
  en: { currency: 'USD', locale: 'en-US' },
  pt: { currency: 'BRL', locale: 'pt-BR' },
  es: { currency: 'USD', locale: 'es-ES' },
  fr: { currency: 'EUR', locale: 'fr-FR' },
}

export function formatCurrency(value: number, locale: Locale = 'en'): string {
  const config = currencyMap[locale]
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDate(dateStr: string, locale: Locale = 'en'): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(currencyMap[locale].locale, {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDateFull(dateStr: string, locale: Locale = 'en'): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(currencyMap[locale].locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatMonthShort(date: Date, locale: Locale = 'en'): string {
  return date.toLocaleString(currencyMap[locale].locale, { month: 'short' })
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}
