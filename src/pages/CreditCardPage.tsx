import { useMemo } from 'react'
import { CreditCard as CreditCardIcon, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TransactionList } from '@/components/TransactionList'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'

export function CreditCardPage() {
  const creditCards = useStore((s) => s.creditCards)
  const transactions = useStore((s) => s.transactions)
  const { t, locale } = useI18n()

  const creditTransactions = useMemo(
    () => transactions.filter((tx) => tx.paymentMethod === 'credit'),
    [transactions]
  )

  const currentMonthCredit = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return creditTransactions
      .filter((tx) => new Date(tx.date) >= start)
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [creditTransactions])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">{t.creditCards.title}</h1>
        <p className="text-sm text-muted-foreground">{t.creditCards.subtitle}</p>
      </div>

      {creditCards.map((card) => {
        const usagePercent = Math.min((card.used / card.limit) * 100, 100)
        const available = card.limit - card.used
        const isHigh = usagePercent > 75

        return (
          <div key={card.id} className="space-y-4">
            <div
              className="relative rounded-2xl p-6 text-white overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${card.color}, ${card.color}dd, ${card.color}99)`,
              }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <CreditCardIcon className="h-8 w-8 opacity-80" />
                  <span className="text-sm font-medium opacity-80">{card.name}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{formatCurrency(card.used, locale)}</p>
                <p className="text-sm opacity-80">
                  {t.common.of} {formatCurrency(card.limit, locale)} {t.creditCards.limit}
                </p>
                <div className="mt-4 flex justify-between text-xs opacity-70">
                  <span>{t.creditCards.closesOn.replace('{day}', String(card.closingDay))}</span>
                  <span>{t.creditCards.dueOn.replace('{day}', String(card.dueDay))}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t.creditCards.used}</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(card.used, locale)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t.creditCards.available}</p>
                  <p className="text-lg font-bold text-green-500">{formatCurrency(available, locale)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t.creditCards.thisMonth}</p>
                  <p className="text-lg font-bold">{formatCurrency(currentMonthCredit, locale)}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t.creditCards.creditUsage}</span>
                  <div className="flex items-center gap-2">
                    {isHigh && <AlertCircle className="h-4 w-4 text-warning" />}
                    <Badge variant={isHigh ? 'warning' : 'success'}>
                      {usagePercent.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={usagePercent}
                  indicatorColor={isHigh ? 'hsl(var(--warning))' : 'hsl(var(--success))'}
                />
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm">{t.creditCards.currentInvoice}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(card.used, locale)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.creditCards.closesOnThe.replace('{day}', String(card.closingDay))}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm">{t.creditCards.upcomingInvoice}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-muted-foreground">{formatCurrency(0, locale)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.creditCards.dueOnThe.replace('{day}', String(card.dueDay))}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      })}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t.creditCards.creditCardTransactions}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <TransactionList transactions={creditTransactions} showDelete />
        </CardContent>
      </Card>
    </div>
  )
}
