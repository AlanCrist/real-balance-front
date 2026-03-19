import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Trash2, CreditCard, Banknote, DollarSign, Smartphone, ArrowUpRight, ArrowDownRight, RefreshCw, Edit2, Check } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { getCategoryColor } from '@/utils/categoryColors'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { TransactionEditModal } from './TransactionEditModal'
import type { Transaction, PaymentMethod } from '@/types'

const paymentIcons: Record<PaymentMethod, typeof CreditCard> = {
  credit: CreditCard,
  debit: Banknote,
  cash: DollarSign,
  pix: Smartphone,
}

const SWIPE_THRESHOLD = 80

interface TransactionListProps {
  transactions: Transaction[]
  showDelete?: boolean
  compact?: boolean
  showEdit?: boolean
}

function SwipeableRow({
  tx,
  compact,
  showEdit,
  showDelete,
  onEdit,
  onDelete,
  onToggleStatus,
  t,
  locale,
}: {
  tx: Transaction
  compact: boolean
  showEdit: boolean
  showDelete: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, currentStatus: string) => void
  t: any
  locale: string
}) {
  const x = useMotionValue(0)
  const leftBg = useTransform(x, [0, SWIPE_THRESHOLD], ['rgba(34,197,94,0)', 'rgba(34,197,94,0.2)'])
  const rightBg = useTransform(x, [-SWIPE_THRESHOLD, 0], ['rgba(239,68,68,0.2)', 'rgba(239,68,68,0)'])
  const leftIconOpacity = useTransform(x, [0, SWIPE_THRESHOLD * 0.4, SWIPE_THRESHOLD], [0, 0, 1])
  const rightIconOpacity = useTransform(x, [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.4, 0], [1, 0, 0])

  const catColor = getCategoryColor(tx.category)
  const PaymentIcon = paymentIcons[tx.paymentMethod]
  const isExpense = tx.type === 'expense'
  const paymentLabel = t.paymentMethods[tx.paymentMethod as keyof typeof t.paymentMethods] || tx.paymentMethod

  const handleDragEnd = useCallback((_: any, info: { offset: { x: number } }) => {
    if (info.offset.x > SWIPE_THRESHOLD && showEdit && isExpense) {
      onToggleStatus(tx.id, tx.status)
    } else if (info.offset.x < -SWIPE_THRESHOLD && showDelete) {
      onDelete(tx.id)
    }
  }, [tx.id, tx.status, showEdit, showDelete, isExpense, onToggleStatus, onDelete])

  return (
    <motion.div
      key={tx.id}
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-lg"
    >
      {/* Swipe background layers */}
      <motion.div
        className="absolute inset-0 flex items-center justify-start pl-4 rounded-lg"
        style={{ backgroundColor: leftBg }}
      >
        <motion.div style={{ opacity: leftIconOpacity }}>
          <Check className="h-5 w-5 text-green-500" />
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-4 rounded-lg"
        style={{ backgroundColor: rightBg }}
      >
        <motion.div style={{ opacity: rightIconOpacity }}>
          <Trash2 className="h-5 w-5 text-red-500" />
        </motion.div>
      </motion.div>

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          'relative flex items-center gap-3 bg-card transition-colors hover:bg-accent/50 group cursor-grab active:cursor-grabbing',
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

        <div className="flex items-center gap-2 shrink-0">
          {showEdit && isExpense && (
            <div className="flex items-center gap-1">
              {tx.isRecurring && (
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" aria-label={t.common.recurring} />
              )}
              <button
                onClick={() => onToggleStatus(tx.id, tx.status)}
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium transition-all',
                  tx.status === 'paid'
                    ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30'
                )}
              >
                {tx.status === 'paid' ? t.common.paid : t.common.pending}
              </button>
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className={cn('text-sm font-semibold', isExpense ? 'text-destructive' : 'text-green-500')}>
            {isExpense ? '-' : '+'}{formatCurrency(tx.amount, locale)}
          </span>
        </div>

        {showEdit && (
          <button
            onClick={() => onEdit(tx.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground transition-all"
            title={t.transactions.editTransaction}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )}

        {showDelete && (
          <button
            onClick={() => onDelete(tx.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

export function TransactionList({ transactions, showDelete = false, compact = false, showEdit = false }: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const removeTransaction = useStore((s) => s.removeTransaction)
  const updateTransaction = useStore((s) => s.updateTransaction)
  const { t, locale } = useI18n()

  const editingTransaction = editingId ? transactions.find((t) => t.id === editingId) : null

  const handleToggleStatus = useCallback(async (id: string, currentStatus: string) => {
    await updateTransaction(id, { status: currentStatus === 'paid' ? 'pending' : 'paid' })
  }, [updateTransaction])

  const handleDelete = useCallback(async (id: string) => {
    await removeTransaction(id)
  }, [removeTransaction])

  const handleEdit = useCallback((id: string) => {
    setEditingId(id)
  }, [])

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">{t.transactions.noTransactions}</p>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence mode="popLayout">
        <div className="space-y-1">
          {transactions.map((tx) => (
            <SwipeableRow
              key={tx.id}
              tx={tx}
              compact={compact}
              showEdit={showEdit}
              showDelete={showDelete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              t={t}
              locale={locale}
            />
          ))}
        </div>
      </AnimatePresence>

      <TransactionEditModal
        transaction={editingTransaction || null}
        open={editingId !== null}
        onOpenChange={(open) => !open && setEditingId(null)}
      />
    </>
  )
}
