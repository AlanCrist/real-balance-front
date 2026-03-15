import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  CreditCard,
  ArrowRight,
  Plus,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MonthlyChart, CategoryChart } from '@/components/SpendingChart'
import { TransactionList } from '@/components/TransactionList'
import { ExpenseInput } from '@/components/ExpenseInput'
import { FinancialAlerts } from '@/components/FinancialAlerts'
import { Badges } from '@/components/Badges'
import { MonthSelector } from '@/components/MonthSelector'
import { MonthlySummary } from '@/components/MonthlySummary'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'

export function Dashboard() {
  const navigate = useNavigate()
  const transactions = useStore((s) => s.transactions)
  const creditCards = useStore((s) => s.creditCards)
  const currentMonthId = useStore((s) => s.currentMonthId)
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
    () => {
      return transactions
        .filter((t) => {
          if (t.type !== 'expense') return false
          if (t.monthId === currentMonthId) return true
          if (t.monthId === undefined && currentMonthId) {
            const txDate = new Date(t.date)
            // Get the current month's month/year to match against transaction date
            const months = useStore.getState().months
            const currentMonth = months.find((m) => m.id === currentMonthId)
            if (!currentMonth) return false
            return (
              txDate.getMonth() === currentMonth.month &&
              txDate.getFullYear() === currentMonth.year
            )
          }
          return false
        })
        .slice(0, 5)
    },
    [transactions, currentMonthId]
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

      <MonthSelector />

      <ExpenseInput />

      <FinancialAlerts />

      <Badges />

      <MonthlySummary />

      {creditCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Tarjetas de Crédito</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/credit-card')}
                  className="gap-1 text-xs"
                >
                  Ver Todas <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {creditCards.slice(0, 2).map((card) => {
                const usagePercent = Math.min((card.used / card.limit) * 100, 100)
                const available = card.limit - card.used

                return (
                  <div key={card.id} className="p-3 rounded-lg border bg-card/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{card.name}</span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {usagePercent.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={usagePercent} />
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Límite</p>
                        <p className="font-semibold">{formatCurrency(card.limit, locale)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Usado</p>
                        <p className="font-semibold text-destructive">{formatCurrency(card.used, locale)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Disponible</p>
                        <p className="font-semibold text-green-500">{formatCurrency(available, locale)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Card className="overflow-hidden h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                    {idx === 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-0 h-4 w-4 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">{t.dashboard.realBalanceTooltip}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', card.bgColor)}>
                    <card.icon className={cn('h-4 w-4', card.color)} />
                  </div>
                </div>
                <p className={cn('text-xl font-bold', card.color)}>{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t.dashboard.monthlySpendingChart}</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          whileHover={{ y: -2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t.dashboard.byCategory}</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        whileHover={{ y: -2 }}
      >
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
      </motion.div>
    </div>
  )
}
