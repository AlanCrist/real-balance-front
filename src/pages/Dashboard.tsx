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
  AlertTriangle,
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
import { StreakCounter } from '@/components/StreakCounter'
import { MonthSelector } from '@/components/MonthSelector'
import { MonthlySummary } from '@/components/MonthlySummary'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.06 },
  }),
}

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

  // Risk states
  const isLowBalance = realBalance < 500 && realBalance >= 0
  const isNegativeBalance = realBalance < 0
  const totalCreditLimit = creditCards.reduce((s, c) => s + c.limit, 0)
  const overallCreditUsage = totalCreditLimit > 0 ? (creditUsed / totalCreditLimit) * 100 : 0
  const isHighCreditUsage = overallCreditUsage > 70

  const recentTransactions = useMemo(
    () => {
      return transactions
        .filter((tx) => {
          if (tx.type !== 'expense') return false
          if (tx.monthId === currentMonthId) return true
          if (tx.monthId === undefined && currentMonthId) {
            const txDate = new Date(tx.date)
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
      color: isNegativeBalance ? 'text-red-500' : isLowBalance ? 'text-amber-500' : 'text-emerald-500',
      bgColor: isNegativeBalance ? 'bg-red-500/10' : isLowBalance ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      risk: isNegativeBalance ? 'critical' : isLowBalance ? 'warning' : null,
      tooltip: t.dashboard.realBalanceTooltip,
    },
    {
      title: t.dashboard.accountBalance,
      value: formatCurrency(totalBalance, locale),
      subtitle: t.dashboard.allAccountsCombined,
      icon: TrendingUp,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      risk: null,
      tooltip: null,
    },
    {
      title: t.dashboard.creditUsed,
      value: formatCurrency(creditUsed, locale),
      subtitle: t.dashboard.outstandingBalance,
      icon: CreditCard,
      color: isHighCreditUsage ? 'text-red-500' : 'text-orange-500',
      bgColor: isHighCreditUsage ? 'bg-red-500/10' : 'bg-orange-500/10',
      risk: isHighCreditUsage ? 'warning' : null,
      tooltip: null,
    },
    {
      title: t.dashboard.monthlySpending,
      value: formatCurrency(monthlySpending, locale),
      subtitle: t.dashboard.thisMonthSoFar,
      icon: TrendingDown,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      risk: null,
      tooltip: null,
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.dashboard.subtitle}</p>
        </div>
        <Button onClick={() => navigate('/quick-add')} size="sm" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t.dashboard.addExpense}</span>
        </Button>
      </div>

      {/* Streak */}
      <StreakCounter />

      {/* Month Selector */}
      <MonthSelector />

      {/* Expense Input */}
      <ExpenseInput />

      {/* Alerts (with risk animations built-in) */}
      <FinancialAlerts />

      {/* Low / Negative balance hero warning */}
      {(isLowBalance || isNegativeBalance) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'flex items-start gap-3 p-4 rounded-2xl border text-sm font-medium',
            isNegativeBalance
              ? 'bg-red-500/10 border-red-400/50 text-red-600 dark:text-red-400 animate-pulse-danger'
              : 'bg-amber-500/10 border-amber-400/40 text-amber-700 dark:text-amber-400 animate-pulse-warning'
          )}
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          </motion.div>
          <div>
            <p className="font-semibold">
              {isNegativeBalance ? 'Saldo negativo!' : 'Saldo baixo!'}
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              {isNegativeBalance
                ? 'Seu saldo real está negativo. Revise seus gastos e dívidas de crédito.'
                : 'Seu saldo real está abaixo de R$500. Cuidado com novos gastos.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Badges */}
      <Badges />

      {/* Monthly Summary */}
      <MonthlySummary />

      {/* Credit Cards Summary */}
      {creditCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{t.nav.creditCard}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/credit-card')}
                  className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Ver Todas <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {creditCards.slice(0, 2).map((card) => {
                const usagePercent = Math.min((card.used / card.limit) * 100, 100)
                const available = card.limit - card.used
                const cardCritical = usagePercent > 90
                const cardHigh = usagePercent > 70

                return (
                  <div
                    key={card.id}
                    className={cn(
                      'p-3 rounded-xl border bg-card/50 space-y-2 transition-all',
                      cardCritical && 'animate-pulse-danger',
                      cardHigh && !cardCritical && 'animate-pulse-warning'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{card.name}</span>
                      <span className={cn(
                        'text-xs font-bold',
                        cardCritical ? 'text-red-500' : cardHigh ? 'text-amber-500' : 'text-muted-foreground'
                      )}>
                        {usagePercent.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={usagePercent}
                      indicatorColor={cardCritical ? 'hsl(var(--destructive))' : cardHigh ? 'hsl(var(--warning))' : undefined}
                    />
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Limite</p>
                        <p className="font-semibold">{formatCurrency(card.limit, locale)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Usado</p>
                        <p className={cn('font-semibold', cardCritical ? 'text-red-500' : 'text-destructive')}>
                          {formatCurrency(card.used, locale)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Disponível</p>
                        <p className="font-semibold text-emerald-500">{formatCurrency(available, locale)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            custom={idx}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
          >
            <Card
              className={cn(
                'overflow-hidden h-full transition-shadow',
                card.risk === 'critical' && 'animate-pulse-danger',
                card.risk === 'warning' && 'animate-pulse-warning'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground leading-tight">{card.title}</span>
                    {card.tooltip && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-0 h-4 w-4 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">{card.tooltip}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0', card.bgColor)}>
                    <card.icon className={cn('h-4 w-4', card.color)} />
                  </div>
                </div>
                <p className={cn('text-xl font-bold tabular-nums', card.color)}>{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
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
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
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

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
      >
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t.dashboard.recentExpenses}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/transactions')}
                className="text-xs gap-1 text-muted-foreground hover:text-foreground"
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
