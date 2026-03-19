import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/utils/categories'
import type { Transaction, TransactionType, PaymentMethod, TransactionStatus } from '@/types'

interface TransactionEditModalProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionEditModal({ transaction, open, onOpenChange }: TransactionEditModalProps) {
  const updateTransaction = useStore((s) => s.updateTransaction)
  const accounts = useStore((s) => s.accounts)
  const creditCards = useStore((s) => s.creditCards)
  const { t } = useI18n()

  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('other')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit')
  const [accountId, setAccountId] = useState('')
  const [creditCardId, setCreditCardId] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<TransactionStatus>('pending')
  const [isRecurring, setIsRecurring] = useState(false)

  // Sync all fields when transaction changes
  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setDescription(transaction.description)
      setAmount(String(transaction.amount))
      setCategory(transaction.category)
      setPaymentMethod(transaction.paymentMethod)
      setAccountId(transaction.accountId || '')
      setCreditCardId(transaction.creditCardId || '')
      setDate(transaction.date.split('T')[0])
      setStatus(transaction.status)
      setIsRecurring(transaction.isRecurring)
    }
  }, [transaction?.id])

  const handleSave = () => {
    if (!transaction) return
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    updateTransaction(transaction.id, {
      type,
      description,
      amount: numAmount,
      category,
      paymentMethod,
      accountId: accountId || undefined,
      creditCardId: paymentMethod === 'credit' ? (creditCardId || undefined) : undefined,
      date: new Date(date).toISOString(),
      status,
      isRecurring,
    })
    onOpenChange(false)
  }

  if (!transaction) return null

  const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
    { value: 'debit', label: t.paymentMethods.debit },
    { value: 'credit', label: t.paymentMethods.credit },
    { value: 'cash', label: t.paymentMethods.cash },
    { value: 'pix', label: t.paymentMethods.pix },
  ]

  const categoryKeys = CATEGORIES[type === 'income' ? 'income' : 'expense']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.transactions.editTransaction}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.type}</label>
            <div className="grid grid-cols-2 gap-2">
              {(['expense', 'income'] as TransactionType[]).map((tp) => (
                <button
                  key={tp}
                  onClick={() => setType(tp)}
                  className={cn(
                    'py-2 rounded-xl text-sm font-medium border transition-all',
                    type === tp ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-accent'
                  )}
                >
                  {tp === 'expense' ? t.transactions.expense : t.common.income}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.description}</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.amount}</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.date}</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.category}</label>
            <div className="grid grid-cols-3 gap-1.5">
              {categoryKeys.map((key) => {
                const cat = CATEGORIES.all[key]
                const label = t.categories[key as keyof typeof t.categories] || key
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={cn(
                      'flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium border transition-all',
                      category === key ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-accent'
                    )}
                  >
                    <span style={{ color: category === key ? undefined : cat.color }}>{cat.icon}</span>
                    <span className="truncate w-full text-center">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Payment Method (only for expenses) */}
          {type === 'expense' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.paymentMethodLabel}</label>
              <div className="grid grid-cols-4 gap-1.5">
                {paymentMethods.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentMethod(value)}
                    className={cn(
                      'py-2 rounded-xl text-xs font-medium border transition-all',
                      paymentMethod === value ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-accent'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Account selector */}
          {(type === 'income' || (type === 'expense' && paymentMethod !== 'credit')) && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.account}</label>
              <div className="flex flex-wrap gap-1.5">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setAccountId(acc.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                      accountId === acc.id ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-accent'
                    )}
                  >
                    {acc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Credit card selector */}
          {type === 'expense' && paymentMethod === 'credit' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.creditCard}</label>
              <div className="flex flex-wrap gap-1.5">
                {creditCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setCreditCardId(card.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                      creditCardId === card.id ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-accent'
                    )}
                  >
                    {card.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status + Recurring */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={status === 'paid'}
                onChange={(e) => setStatus(e.target.checked ? 'paid' : 'pending')}
                className="rounded"
              />
              <span>{t.common.paid}</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded"
              />
              <span>{t.common.recurring}</span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">{t.common.save}</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">{t.common.cancel}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
