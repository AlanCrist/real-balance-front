import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  CreditCard,
  ArrowRight,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MonthlyChart, CategoryChart } from '@/components/SpendingChart'
import { TransactionList } from '@/components/TransactionList'
import { ExpenseInput } from '@/components/ExpenseInput'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'

export function Dashboard() {
  const navigate = useNavigate()
  const transactions = useStore((s) => s.transactions)
  const getRealBalance = useStore((s) => s.getRealBalance)
  const getTotalBalance = useStore((s) => s.getTotalBalance)
  const getTotalCreditUsed = useStore((s) => s.getTotalCreditUsed)
  const getMonthlySpending = useStore((s) => s.getMonthlySpending)
  const { t, locale } = useI18n()

  const realBalance = getRealBalance()
  const totalBalance = getTotalBalance()
  const creditUsed = getTotalCreditUsed()
  const monthlySpending = getMonthlySpending()

  const recentTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'expense').slice(0, 5),
    [transactions]
  )

  const cards = [
    {
      title: t.dashboard.realBalance,
      value: formatCurrency(realBalance, locale),
      subtitle: t.dashboard.afterCreditDebt,
      icon: Wallet,
      color: realBalance >= 0 ? 'text-green-500' : 'text-destructive',
      bgColor: realBalance >= 0 ? 'bg-green-500/10' : 'bg-destructive/10',
    },
    {
      title: t.dashboard.accountBalance,
      value: formatCurrency(totalBalance, locale),
      subtitle: t.dashboard.allAccountsCombined,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t.dashboard.creditUsed,
      value: formatCurrency(creditUsed, locale),
      subtitle: t.dashboard.outstandingBalance,
      icon: CreditCard,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: t.dashboard.monthlySpending,
      value: formatCurrency(monthlySpending, locale),
      subtitle: t.dashboard.thisMonthSoFar,
      icon: TrendingDown,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
        <Button onClick={() => navigate('/quick-add')} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t.dashboard.addExpense}</span>
        </Button>
      </div>

      <ExpenseInput />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <Card key={card.title} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', card.bgColor)}>
                  <card.icon className={cn('h-4 w-4', card.color)} />
                </div>
              </div>
              <p className={cn('text-xl font-bold', card.color)}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.monthlySpendingChart}</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.byCategory}</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{t.dashboard.recentExpenses}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/transactions')}
              className="text-xs gap-1"
            >
              {t.common.viewAll} <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={recentTransactions} compact />
        </CardContent>
      </Card>
    </div>
  )
}
