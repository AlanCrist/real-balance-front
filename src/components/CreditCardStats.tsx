import { TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CreditCard, Transaction } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { useI18n } from '@/i18n'

interface CreditCardStatsProps {
  card: CreditCard
  transactions: Transaction[]
}

export function CreditCardStats({ card, transactions }: CreditCardStatsProps) {
  const { locale, t } = useI18n()

  // Filter transactions for this card
  const cardTransactions = transactions.filter(
    (tx) => tx.paymentMethod === 'credit' && tx.creditCardId === card.id && tx.type === 'expense'
  )

  // Last 3 months statistics
  const now = new Date()
  const adjustedMonth = ((now.getMonth() - 2) % 12 + 12) % 12
  const threeMonthsBackYear = now.getFullYear() + Math.floor((now.getMonth() - 2) / 12)
  const threeMonthsAgo = new Date(threeMonthsBackYear, adjustedMonth, 1)

  const last3MonthsTransactions = cardTransactions.filter((tx) => {
    const txDate = new Date(tx.date)
    return txDate >= threeMonthsAgo
  })

  const last3MonthsTotal = last3MonthsTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  const averageMonthly = last3MonthsTotal / 3

  // Category breakdown for current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthTransactions = cardTransactions.filter((tx) => {
    const txDate = new Date(tx.date)
    return txDate >= currentMonthStart
  })

  const categoryBreakdown: Record<string, number> = {}
  currentMonthTransactions.forEach((tx) => {
    categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount
  })

  const topCategory = Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]

  const usagePercent = Math.min((card.used / card.limit) * 100, 100)
  const isHighUsage = usagePercent > 75

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">{t.creditCards.thisMonth}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(
              currentMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0),
              locale
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentMonthTransactions.length} {t.creditCards.transactions}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">{t.creditCards.threeMonthAvg}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(averageMonthly, locale)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t.common.of}: {formatCurrency(last3MonthsTotal, locale)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">{t.creditCards.topCategory}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold capitalize">
            {topCategory ? formatCurrency(topCategory[1], locale) : t.creditCards.notApplicable}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {topCategory ? topCategory[0] : t.creditCards.noData}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {isHighUsage && <AlertCircle className="h-4 w-4 text-warning" />}
            <CardTitle className="text-sm">{t.creditCards.limitStatus}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${isHighUsage ? 'text-warning' : 'text-green-500'}`}>
            {usagePercent.toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(card.limit - card.used, locale)} {t.creditCards.available}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
