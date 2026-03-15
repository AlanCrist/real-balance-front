import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'

interface EarnedBadge {
  id: string
  label: string
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
      })
    }

    // First Goal: any goal has currentAmount > 0
    if (goals.some((g) => g.currentAmount > 0)) {
      earned.push({
        id: 'first-goal',
        label: t.badges.firstGoal,
      })
    }

    // Savings Growing: any goal has been contributed to (not just from onboarding)
    if (goals.some((g) => g.currentAmount > 0)) {
      earned.push({
        id: 'savings-growing',
        label: t.badges.savingsGrowing,
      })
    }

    return earned
  }, [transactions, goals, t])

  if (badges.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Badge key={badge.id} variant="secondary" className="text-xs">
          🏅 {badge.label}
        </Badge>
      ))}
    </div>
  )
}
