import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CreditCard as CardIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { getCategoryColor } from '@/utils/categoryColors'
import { CATEGORIES } from '@/utils/categories'
import { cn } from '@/lib/utils'
import type { CreditCard, Transaction } from '@/types'

interface CardStatementProps {
  card: CreditCard
}

interface BillingCycle {
  label: string
  startDate: Date
  endDate: Date
  dueDate: Date
  transactions: Transaction[]
  total: number
  isCurrent: boolean
  isFuture: boolean
}

function buildCycles(card: CreditCard, transactions: Transaction[], count = 6): BillingCycle[] {
  const now = new Date()
  const cycles: BillingCycle[] = []

  for (let offset = -(count - 2); offset <= 1; offset++) {
    // cycle end = closingDay of (now.month + offset)
    const endY = now.getFullYear() + Math.floor((now.getMonth() + offset) / 12)
    const endM = ((now.getMonth() + offset) % 12 + 12) % 12
    const endDate = new Date(endY, endM, card.closingDay)

    // cycle start = day after closing of previous month
    const startBase = new Date(endDate)
    startBase.setMonth(startBase.getMonth() - 1)
    const startDate = new Date(startBase.getFullYear(), startBase.getMonth(), card.closingDay + 1)

    // due date = dueDay of month after closing
    const dueDate = new Date(endY, endM + 1, card.dueDay)

    const cycleTxs = transactions.filter((tx) => {
      if (tx.creditCardId !== card.id) return false
      const d = new Date(tx.date)
      return d >= startDate && d <= endDate
    })

    const total = cycleTxs.reduce((sum, tx) => sum + tx.amount, 0)

    const isCurrent = now >= startDate && now <= endDate
    const isFuture = startDate > now

    cycles.push({
      label: endDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      startDate,
      endDate,
      dueDate,
      transactions: cycleTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      total,
      isCurrent,
      isFuture,
    })
  }

  return cycles
}

export function CardStatement({ card }: CardStatementProps) {
  const transactions = useStore((s) => s.transactions)
  const { t, locale } = useI18n()

  const cycles = useMemo(() => buildCycles(card, transactions), [card, transactions])
  const currentCycleIndex = cycles.findIndex((c) => c.isCurrent)
  const [selectedIndex, setSelectedIndex] = useState(currentCycleIndex >= 0 ? currentCycleIndex : cycles.length - 2)

  const cycle = cycles[selectedIndex]
  if (!cycle) return null

  const canPrev = selectedIndex > 0
  const canNext = selectedIndex < cycles.length - 1

  const cycleStatus = cycle.isCurrent
    ? t.creditCards.currentCycle
    : cycle.isFuture
    ? t.creditCards.futureCycle
    : t.creditCards.pastCycle

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t.creditCards.statement}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-muted-foreground min-w-[120px] text-center capitalize">
            {cycle.label}
          </span>
          <button
            onClick={() => setSelectedIndex((i) => Math.min(cycles.length - 1, i + 1))}
            disabled={!canNext}
            className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Card className={cn(
        'border transition-all',
        cycle.isCurrent && 'border-violet-500/30 bg-violet-500/5',
        cycle.isFuture && 'border-blue-500/30 bg-blue-500/5',
      )}>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={cycle.isCurrent ? 'default' : cycle.isFuture ? 'secondary' : 'outline'} className="text-xs mb-2">
                {cycleStatus}
              </Badge>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{t.creditCards.cycleCloses}: {cycle.endDate.toLocaleDateString(locale)}</span>
                <span>{t.creditCards.cycleDue}: {cycle.dueDate.toLocaleDateString(locale)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t.creditCards.cycleTotal}</p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(cycle.total, locale)}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <AnimatePresence mode="wait">
            {cycle.transactions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-muted-foreground"
              >
                <CardIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t.creditCards.noStatements}</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                {cycle.transactions.map((tx) => {
                  const catColor = getCategoryColor(tx.category)
                  const catMeta = CATEGORIES.all[tx.category]
                  const catLabel = catMeta?.icon || '•'
                  const isIncome = tx.type === 'income'

                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                        style={{ backgroundColor: catColor + '20' }}
                      >
                        {catLabel}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize truncate">{tx.description}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{formatDate(tx.date, locale)}</span>
                          {tx.installments && (
                            <>
                              <span>·</span>
                              <span className="text-violet-500 font-medium">
                                {t.transactions.installmentOf
                                  .replace('{current}', String(tx.installments.current))
                                  .replace('{total}', String(tx.installments.total))}
                              </span>
                            </>
                          )}
                          {tx.status === 'pending' && (
                            <>
                              <span>·</span>
                              <span className="text-amber-500">{t.common.pending}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={cn('text-sm font-semibold shrink-0', isIncome ? 'text-emerald-500' : 'text-destructive')}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, locale)}
                      </span>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
