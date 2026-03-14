import { Languages } from 'lucide-react'
import { useI18n, locales, type Locale } from '@/i18n'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  variant?: 'sidebar' | 'compact'
}

export function LanguageSwitcher({ variant = 'sidebar' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n()

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        {(Object.keys(locales) as Locale[]).map((code) => (
          <button
            key={code}
            onClick={() => setLocale(code)}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium transition-colors',
              locale === code
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent'
            )}
          >
            {locales[code].flag}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="px-3">
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
        <Languages className="h-3.5 w-3.5" />
        <span>{t.common.language}</span>
      </div>
      <div className="flex gap-1 px-3 pb-2">
        {(Object.keys(locales) as Locale[]).map((code) => (
          <button
            key={code}
            onClick={() => setLocale(code)}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium transition-colors',
              locale === code
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent'
            )}
            title={locales[code].label}
          >
            {locales[code].flag}
          </button>
        ))}
      </div>
    </div>
  )
}
