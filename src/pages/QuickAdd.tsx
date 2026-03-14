import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpenseInput } from '@/components/ExpenseInput'
import { useI18n } from '@/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function QuickAdd() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
      <div className="absolute top-4 left-4 lg:left-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.common.back}
        </Button>
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Zap className="h-3.5 w-3.5" />
          {t.quickAdd.badge}
        </div>
        <h1 className="text-3xl font-bold mb-2">{t.quickAdd.title}</h1>
        <p className="text-muted-foreground">
          {t.quickAdd.subtitle}
        </p>
      </div>

      <ExpenseInput
        autoFocus
        size="large"
        onSuccess={() => {}}
        className="w-full max-w-md px-4"
      />

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs text-muted-foreground max-w-md px-4">
        <div className="p-3 rounded-lg bg-card border">
          <p className="font-medium text-foreground mb-1">{t.quickAdd.example1Title}</p>
          <p>{t.quickAdd.example1Desc}</p>
        </div>
        <div className="p-3 rounded-lg bg-card border">
          <p className="font-medium text-foreground mb-1">{t.quickAdd.example2Title}</p>
          <p>{t.quickAdd.example2Desc}</p>
        </div>
        <div className="p-3 rounded-lg bg-card border">
          <p className="font-medium text-foreground mb-1">{t.quickAdd.example3Title}</p>
          <p>{t.quickAdd.example3Desc}</p>
        </div>
      </div>
    </div>
  )
}
