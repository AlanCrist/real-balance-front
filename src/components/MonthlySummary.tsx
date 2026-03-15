import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'

export function MonthlySummary() {
  const getMonthlyIncome = useStore((s) => s.getMonthlyIncome)
  const getMonthlyFixed = useStore((s) => s.getMonthlyFixed)
  const getMonthlyVariable = useStore((s) => s.getMonthlyVariable)
  const { t, locale } = useI18n()

  const income = getMonthlyIncome()
  const fixed = getMonthlyFixed()
  const variable = getMonthlyVariable()
  const projected = income - (fixed + variable)

  const cards = [
    { label: t.dashboard.monthlyIncome, value: income, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: t.dashboard.fixedExpenses, value: fixed, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: t.dashboard.variableExpenses, value: variable, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { label: t.dashboard.projectedBalance, value: projected, color: projected >= 0 ? 'text-green-500' : 'text-destructive', bgColor: projected >= 0 ? 'bg-green-500/10' : 'bg-destructive/10' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={cn('p-4 rounded-lg border bg-card/50', card.bgColor)}>
          <p className="text-xs font-medium text-muted-foreground mb-2">{card.label}</p>
          <p className={cn('text-xl font-bold', card.color)}>
            {formatCurrency(card.value, locale)}
          </p>
        </div>
      ))}
    </div>
  )
}
