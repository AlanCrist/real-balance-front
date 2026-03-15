import { useMemo } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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

    // Current month spending
    const currentMonthSpending = transactions
      .filter((t) => t.type === 'expense' && new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0)

    // Last month spending
    const lastMonthSpending = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.date) >= startOfLastMonth &&
          new Date(t.date) <= endOfLastMonth
      )
      .reduce((sum, t) => sum + t.amount, 0)

    // Spending trend
    const spendingChange =
      lastMonthSpending > 0
        ? Math.round(((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100)
        : 0
    const spendingTrendUp = currentMonthSpending > lastMonthSpending

    // Daily average
    const dailyAverage = currentMonthSpending / daysElapsed
    const projectedMonthly = dailyAverage * daysInMonth

    // Category breakdown
    const categoryBreakdown = transactions
      .filter((t) => t.type === 'expense' && new Date(t.date) >= startOfMonth)
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>
      )

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Credit risk
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

  const getCreditRiskColor = (utilization: number) => {
    if (utilization < 50) return 'text-green-500'
    if (utilization < 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getCreditRiskBg = (utilization: number) => {
    if (utilization < 50) return 'bg-green-500/10'
    if (utilization < 70) return 'bg-yellow-500/10'
    return 'bg-red-500/10'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">{t.insights.title}</h1>
        <p className="text-sm text-muted-foreground">{t.insights.subtitle}</p>
      </div>

      {/* Spending Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t.insights.spendingTrend}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">{t.insights.vsLastMonth}</span>
              <div className="flex items-center gap-2">
                {insights.spendingTrendUp ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <span
                  className={cn(
                    'text-2xl font-bold',
                    insights.spendingTrendUp ? 'text-red-500' : 'text-green-500'
                  )}
                >
                  {insights.spendingChange > 0 ? '+' : ''} {insights.spendingChange}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.insights.lastMonth}: {formatCurrency(insights.lastMonthSpending, locale)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.insights.thisMonth}: {formatCurrency(insights.currentMonthSpending, locale)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Daily Average & Projected Monthly */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.insights.dailyAverage}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(insights.dailyAverage, locale)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t.insights.dailyAverage}</p>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-1">{t.insights.projectedMonthly}</p>
              <p className="text-xl font-bold">{formatCurrency(insights.projectedMonthly, locale)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Credit Risk */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.insights.creditRisk}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">{t.insights.creditLimitUsage}</span>
                <span className={cn('font-bold', getCreditRiskColor(insights.creditUtilization))}>
                  {insights.creditUtilization.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={Math.min(insights.creditUtilization, 100)}
                className="h-2"
              />
              <div className={cn(
                'p-3 rounded-lg flex items-start gap-2',
                getCreditRiskBg(insights.creditUtilization)
              )}>
                <AlertTriangle className={cn('h-4 w-4 flex-shrink-0 mt-0.5', getCreditRiskColor(insights.creditUtilization))} />
                <div className="text-xs">
                  {getCreditRiskMessage(insights.creditUtilization)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t.insights.categoryBreakdown}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.topCategories.length > 0 ? (
            <div className="space-y-3">
              {insights.topCategories.map(([category, amount]) => {
                const percentage = (amount / insights.currentMonthSpending) * 100
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm capitalize font-medium">{category}</span>
                      <span className="text-sm font-bold">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(amount, locale)}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t.transactions.noExpensesThisMonth}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
