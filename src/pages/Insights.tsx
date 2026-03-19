import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Zap, BarChart2, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'

export function Insights() {
  const transactions = useStore((s) => s.transactions)
  const creditCards = useStore((s) => s.creditCards)
  const { t, locale } = useI18n()

  const getCreditRiskMessage = (utilization: number): string => {
    if (utilization < 50) return t.insights.creditRiskLow
    if (utilization < 70) return t.insights.creditRiskMedium
    return t.insights.creditRiskHigh
  }

  const insights = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysElapsed = now.getDate()

    const currentMonthSpending = transactions
      .filter((tx) => tx.type === 'expense' && new Date(tx.date) >= startOfMonth)
      .reduce((sum, tx) => sum + tx.amount, 0)

    const lastMonthSpending = transactions
      .filter(
        (tx) =>
          tx.type === 'expense' &&
          new Date(tx.date) >= startOfLastMonth &&
          new Date(tx.date) <= endOfLastMonth
      )
      .reduce((sum, tx) => sum + tx.amount, 0)

    const spendingChange =
      lastMonthSpending > 0
        ? Math.round(((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100)
        : 0
    const spendingTrendUp = currentMonthSpending > lastMonthSpending

    const dailyAverage = currentMonthSpending / daysElapsed
    const projectedMonthly = dailyAverage * daysInMonth

    const categoryBreakdown = transactions
      .filter((tx) => tx.type === 'expense' && new Date(tx.date) >= startOfMonth)
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount
        return acc
      }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const totalCreditUsed = creditCards.reduce((sum, c) => sum + c.used, 0)
    const totalCreditLimit = creditCards.reduce((sum, c) => sum + c.limit, 0)
    const creditUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0

    return {
      spendingChange,
      spendingTrendUp,
      lastMonthSpending,
      currentMonthSpending,
      dailyAverage,
      projectedMonthly,
      topCategories,
      creditUtilization,
      totalCreditUsed,
      totalCreditLimit,
    }
  }, [transactions, creditCards])

  const getCreditRiskColor = (u: number) => {
    if (u < 50) return 'text-emerald-500'
    if (u < 70) return 'text-amber-500'
    return 'text-red-500'
  }

  const getCreditRiskBg = (u: number) => {
    if (u < 50) return 'bg-emerald-500/10 border-emerald-500/20'
    if (u < 70) return 'bg-amber-500/10 border-amber-500/20'
    return 'bg-red-500/10 border-red-500/20 animate-pulse-danger'
  }

  const getCreditBarColor = (u: number) => {
    if (u < 50) return '#22c55e'
    if (u < 70) return '#f59e0b'
    return '#ef4444'
  }

  const categoryColors = [
    '#7c3aed', '#3b82f6', '#ec4899', '#f59e0b', '#10b981',
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.insights.title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t.insights.subtitle}</p>
      </div>

      {/* Spending Trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">{t.insights.spendingTrend}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t.insights.vsLastMonth}</p>
                <p className="text-xs text-muted-foreground">
                  {t.insights.lastMonth}: <span className="font-medium text-foreground">{formatCurrency(insights.lastMonthSpending, locale)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.insights.thisMonth}: <span className="font-medium text-foreground">{formatCurrency(insights.currentMonthSpending, locale)}</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'h-14 w-14 rounded-2xl flex items-center justify-center',
                  insights.spendingTrendUp ? 'bg-red-500/10' : 'bg-emerald-500/10'
                )}>
                  {insights.spendingTrendUp
                    ? <TrendingUp className="h-6 w-6 text-red-500" />
                    : <TrendingDown className="h-6 w-6 text-emerald-500" />
                  }
                </div>
                <span className={cn(
                  'text-2xl font-bold tabular-nums',
                  insights.spendingTrendUp ? 'text-red-500' : 'text-emerald-500'
                )}>
                  {insights.spendingChange > 0 ? '+' : ''}{insights.spendingChange}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Average + Projected */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{t.insights.dailyAverage}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-violet-500 tabular-nums">
                  {formatCurrency(insights.dailyAverage, locale)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">por dia, em média</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">{t.insights.projectedMonthly}</p>
                <p className="text-xl font-bold tabular-nums">{formatCurrency(insights.projectedMonthly, locale)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Animated Credit Risk Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className={cn('h-full border', getCreditRiskBg(insights.creditUtilization))}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Zap className={cn('h-4 w-4', getCreditRiskColor(insights.creditUtilization))} />
                <CardTitle className="text-sm font-medium">{t.insights.creditRisk}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Animated gauge */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">{t.insights.creditLimitUsage}</span>
                  <motion.span
                    key={insights.creditUtilization}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn('text-2xl font-bold tabular-nums', getCreditRiskColor(insights.creditUtilization))}
                  >
                    {insights.creditUtilization.toFixed(1)}%
                  </motion.span>
                </div>

                {/* Segmented gauge bar */}
                <div className="relative h-3 rounded-full overflow-hidden bg-secondary">
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ backgroundColor: getCreditBarColor(insights.creditUtilization) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(insights.creditUtilization, 100)}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                  />
                  {/* Zone markers */}
                  <div className="absolute top-0 bottom-0 border-l-2 border-white/50" style={{ left: '50%' }} />
                  <div className="absolute top-0 bottom-0 border-l-2 border-white/50" style={{ left: '70%' }} />
                </div>

                {/* Zone labels */}
                <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                  <span className="text-emerald-500 font-medium">Seguro</span>
                  <span className="text-amber-500 font-medium">Atenção</span>
                  <span className="text-red-500 font-medium">Risco</span>
                </div>
              </div>

              <div className="pt-1">
                <p className={cn('text-xs font-medium leading-relaxed', getCreditRiskColor(insights.creditUtilization))}>
                  {getCreditRiskMessage(insights.creditUtilization)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.insights.categoryBreakdown}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.topCategories.length > 0 ? (
              insights.topCategories.map(([category, amount], i) => {
                const percentage = (amount / insights.currentMonthSpending) * 100
                const color = categoryColors[i % categoryColors.length]
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium capitalize">
                          {t.categories[category as keyof typeof t.categories] || category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatCurrency(amount, locale)}</span>
                        <span className="text-sm font-bold tabular-nums" style={{ color }}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 + i * 0.05 }}
                      />
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t.transactions.noExpensesThisMonth}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
