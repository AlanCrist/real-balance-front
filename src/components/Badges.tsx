import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'

interface EarnedBadge {
  id: string
  label: string
  emoji: string
  variant: 'secondary' | 'success' | 'warning'
}

export function Badges() {
  const transactions = useStore((s) => s.transactions)
  const goals = useStore((s) => s.goals)
  const { t } = useI18n()

  const badges = useMemo<EarnedBadge[]>(() => {
    const earned: EarnedBadge[] = []

    // Tracking Streak: 5+ consecutive days with expenses
    const expenseDates = new Set<string>()
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const date = new Date(t.date).toISOString().split('T')[0]
        expenseDates.add(date)
      })

    if (expenseDates.size > 0) {
      const sortedDates = Array.from(expenseDates).sort()
      let maxStreak = 1
      let currentStreak = 1

      for (let i = 1; i < sortedDates.length; i++) {
        const curr = new Date(sortedDates[i])
        const prev = new Date(sortedDates[i - 1])
        const dayDiff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))

        if (dayDiff === 1) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 1
        }
      }

      if (maxStreak >= 5) {
        earned.push({
          id: 'tracking-streak',
          label: t.badges.trackingStreak.replace('{count}', String(maxStreak)),
          emoji: '🔥',
          variant: maxStreak >= 15 ? 'warning' : 'secondary',
        })
      }
    }

    // Under Budget: current month < 80% of last month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const currentMonthSpending = transactions
      .filter((t) => t.type === 'expense' && new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0)

    const lastMonthSpending = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.date) >= startOfLastMonth &&
          new Date(t.date) <= endOfLastMonth
      )
      .reduce((sum, t) => sum + t.amount, 0)

    if (lastMonthSpending > 0 && currentMonthSpending < lastMonthSpending * 0.8) {
      earned.push({
        id: 'under-budget',
        label: t.badges.underBudget,
        emoji: '💰',
        variant: 'success',
      })
    }

    // First Goal: any goal exists with currentAmount > 0
    if (goals.some((g) => g.currentAmount > 0)) {
      earned.push({
        id: 'first-goal',
        label: t.badges.firstGoal,
        emoji: '🎯',
        variant: 'secondary',
      })
    }

    // Goal Reached: any goal where currentAmount >= targetAmount
    if (goals.some((g) => g.currentAmount >= g.targetAmount && g.targetAmount > 0)) {
      earned.push({
        id: 'savings-goal-reached',
        label: t.badges.savingsGoalReached,
        emoji: '🏆',
        variant: 'warning',
      })
    }

    return earned
  }, [transactions, goals, t])

  if (badges.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 px-4 py-3">
        <span className="text-lg">🎮</span>
        <p className="text-xs text-muted-foreground">
          {t.badges.emptyState}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Badge key={badge.id} variant={badge.variant} className="text-xs gap-1">
          <span>{badge.emoji}</span> {badge.label}
        </Badge>
      ))}
    </div>
  )
}
