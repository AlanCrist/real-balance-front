import { Trash2, CreditCard, Banknote, DollarSign, Smartphone, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Transaction, PaymentMethod } from '@/types'

const paymentIcons: Record<PaymentMethod, typeof CreditCard> = {
  credit: CreditCard,
  debit: Banknote,
  cash: DollarSign,
  pix: Smartphone,
}

interface TransactionListProps {
  transactions: Transaction[]
  showDelete?: boolean
  compact?: boolean
}

export function TransactionList({ transactions, showDelete = false, compact = false }: TransactionListProps) {
  const removeTransaction = useStore((s) => s.removeTransaction)
  const { t, locale } = useI18n()

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">{t.transactions.noTransactions}</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {transactions.map((tx) => {
        const catColor = getCategoryColor(tx.category)
        const PaymentIcon = paymentIcons[tx.paymentMethod]
        const isExpense = tx.type === 'expense'
        const paymentLabel = t.paymentMethods[tx.paymentMethod as keyof typeof t.paymentMethods] || tx.paymentMethod

        return (
          <div
            key={tx.id}
            className={cn(
              'flex items-center gap-3 rounded-lg transition-colors hover:bg-accent/50 group',
              compact ? 'px-2 py-2' : 'px-3 py-3'
            )}
          >
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: catColor + '20', color: catColor }}
            >
              {isExpense ? (
                <ArrowDownRight className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium capitalize truncate">{tx.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{formatDate(tx.date, locale)}</span>
                <span>·</span>
                <PaymentIcon className="h-3 w-3" />
                <span>{paymentLabel}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={cn('text-sm font-semibold', isExpense ? 'text-destructive' : 'text-green-500')}>
                {isExpense ? '-' : '+'}{formatCurrency(tx.amount, locale)}
              </span>
            </div>

            {showDelete && (
              <button
                onClick={() => removeTransaction(tx.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    food: '#f97316', groceries: '#22c55e', transport: '#3b82f6', health: '#ef4444',
    entertainment: '#8b5cf6', housing: '#06b6d4', shopping: '#ec4899', education: '#f59e0b',
    other: '#6b7280',
  }
  return colors[category] || '#6b7280'
}
