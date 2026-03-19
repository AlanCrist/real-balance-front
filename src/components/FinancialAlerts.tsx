import { useMemo, useState } from 'react'
import { AlertTriangle, TrendingUp, Target, X, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'credit' | 'spending' | 'goal'
  severity: 'critical' | 'warning' | 'info'
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

const severityConfig = {
  critical: {
    bg: 'bg-red-500/10 dark:bg-red-950/40',
    border: 'border-red-400/50 dark:border-red-700/50',
    text: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-500/15',
    pulse: 'animate-pulse-danger',
  },
  warning: {
    bg: 'bg-amber-500/10 dark:bg-amber-950/30',
    border: 'border-amber-400/40 dark:border-amber-700/40',
    text: 'text-amber-700 dark:text-amber-400',
    iconBg: 'bg-amber-500/15',
    pulse: 'animate-pulse-warning',
  },
  info: {
    bg: 'bg-violet-500/10 dark:bg-violet-950/30',
    border: 'border-violet-400/30 dark:border-violet-700/30',
    text: 'text-violet-700 dark:text-violet-400',
    iconBg: 'bg-violet-500/15',
    pulse: '',
  },
}

export function FinancialAlerts() {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const creditCards = useStore((s) => s.creditCards)
  const transactions = useStore((s) => s.transactions)
  const goals = useStore((s) => s.goals)
  const { t } = useI18n()

  const alerts = useMemo<Alert[]>(() => {
    const newAlerts: Alert[] = []

    // Credit usage alerts with severity levels
    creditCards.forEach((card) => {
      const usage = (card.used / card.limit) * 100
      if (usage > 90) {
        newAlerts.push({
          id: `credit-critical-${card.id}`,
          type: 'credit',
          severity: 'critical',
          message: replacePlaceholders(t.alerts.creditUsageHigh, { percent: usage.toFixed(0) }),
          icon: Zap,
        })
      } else if (usage > 70) {
        newAlerts.push({
          id: `credit-${card.id}`,
          type: 'credit',
          severity: 'warning',
          message: replacePlaceholders(t.alerts.creditUsageHigh, { percent: usage.toFixed(0) }),
          icon: AlertTriangle,
        })
      }
    })

    // Spending increase alerts
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

    Object.entries(currentMonthByCategory).forEach(([category, currentAmount]) => {
      const lastAmount = lastMonthByCategory[category] || 0
      if (lastAmount > 0) {
        const increase = ((currentAmount - lastAmount) / lastAmount) * 100
        if (increase > 50) {
          newAlerts.push({
            id: `spending-${category}`,
            type: 'spending',
            severity: 'warning',
            message: replacePlaceholders(t.alerts.spendingIncrease, {
              percent: increase.toFixed(0),
              category,
            }),
            icon: TrendingUp,
          })
        } else if (increase > 30) {
          newAlerts.push({
            id: `spending-${category}`,
            type: 'spending',
            severity: 'info',
            message: replacePlaceholders(t.alerts.spendingIncrease, {
              percent: increase.toFixed(0),
              category,
            }),
            icon: TrendingUp,
          })
        }
      }
    })

    // Goal almost reached
    goals.forEach((goal) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100
      if (progress > 85 && progress < 100) {
        newAlerts.push({
          id: `goal-${goal.id}`,
          type: 'goal',
          severity: 'info',
          message: replacePlaceholders(t.alerts.goalAlmostReached, { goal: goal.name }),
          icon: Target,
        })
      }
    })

    // Sort: critical first, then warning, then info
    return newAlerts.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 }
      return order[a.severity] - order[b.severity]
    })
  }, [creditCards, transactions, goals, t])

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id))

  if (visibleAlerts.length === 0) return null

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {visibleAlerts.map((alert) => {
          const Icon = alert.icon
          const config = severityConfig[alert.severity]

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'flex items-start gap-3 p-3.5 rounded-xl border text-sm',
                config.bg,
                config.border,
                config.text,
                alert.severity === 'critical' && config.pulse
              )}
            >
              <div className={cn('flex-shrink-0 p-1.5 rounded-lg', config.iconBg)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="flex-1 font-medium leading-relaxed">{alert.message}</span>
              <button
                onClick={() => setDismissedAlerts((prev) => new Set(prev).add(alert.id))}
                className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5 opacity-60" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
