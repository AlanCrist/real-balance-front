import { useMemo, useState } from 'react'
import { AlertTriangle, TrendingUp, Target, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'credit' | 'spending' | 'goal'
  message: string
  icon: typeof AlertTriangle
}

function replacePlaceholders(
  template: string,
  placeholders: Record<string, string | number>
): string {
  return Object.entries(placeholders).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    template
  )
}

export function FinancialAlerts() {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const creditCards = useStore((s) => s.creditCards)
  const transactions = useStore((s) => s.transactions)
  const goals = useStore((s) => s.goals)
  const { t } = useI18n()

  const alerts = useMemo<Alert[]>(() => {
    const newAlerts: Alert[] = []

    // Credit usage > 70%
    creditCards.forEach((card) => {
      const usage = (card.used / card.limit) * 100
      if (usage > 70) {
        newAlerts.push({
          id: `credit-${card.id}`,
          type: 'credit',
          message: replacePlaceholders(t.alerts.creditUsageHigh, { percent: usage.toFixed(0) }),
          icon: AlertTriangle,
        })
      }
    })

    // Spending increase: compare current month vs last month by category
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const currentMonthByCategory: Record<string, number> = {}
    const lastMonthByCategory: Record<string, number> = {}

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date)
      if (tx.type === 'expense') {
        if (txDate >= startOfMonth) {
          currentMonthByCategory[tx.category] = (currentMonthByCategory[tx.category] || 0) + tx.amount
        }
        if (txDate >= startOfLastMonth && txDate <= endOfLastMonth) {
          lastMonthByCategory[tx.category] = (lastMonthByCategory[tx.category] || 0) + tx.amount
        }
      }
    })

    // Check for significant category increases
    Object.entries(currentMonthByCategory).forEach(([category, currentAmount]) => {
      const lastAmount = lastMonthByCategory[category] || 0
      if (lastAmount > 0) {
        const increase = ((currentAmount - lastAmount) / lastAmount) * 100
        if (increase > 30) {
          newAlerts.push({
            id: `spending-${category}`,
            type: 'spending',
            message: replacePlaceholders(t.alerts.spendingIncrease, {
              percent: increase.toFixed(0),
              category: category,
            }),
            icon: TrendingUp,
          })
        }
      }
    })

    // Goal almost reached: > 85%
    goals.forEach((goal) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100
      if (progress > 85 && progress < 100) {
        newAlerts.push({
          id: `goal-${goal.id}`,
          type: 'goal',
          message: replacePlaceholders(t.alerts.goalAlmostReached, {
            goal: goal.name,
          }),
          icon: Target,
        })
      }
    })

    return newAlerts
  }, [creditCards, transactions, goals, t])

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id))

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => {
        const Icon = alert.icon
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border text-sm',
              alert.type === 'credit' && 'border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400',
              alert.type === 'spending' && 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400',
              alert.type === 'goal' && 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{alert.message}</span>
            <button
              onClick={() => setDismissedAlerts((prev) => new Set(prev).add(alert.id))}
              className="flex-shrink-0 text-current/50 hover:text-current transition-colors p-0.5"
              aria-label="Dismiss alert"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
