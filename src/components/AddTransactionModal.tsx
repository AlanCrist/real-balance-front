import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/utils/categories'
import type { TransactionType, PaymentMethod } from '@/types'

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultType?: TransactionType
}

export function AddTransactionModal({ open, onOpenChange, defaultType = 'expense' }: AddTransactionModalProps) {
  const addTransaction = useStore((s) => s.addTransaction)
  const accounts = useStore((s) => s.accounts)
  const creditCards = useStore((s) => s.creditCards)
  const currentMonthId = useStore((s) => s.currentMonthId)
  const { t } = useI18n()

  const [type, setType] = useState<TransactionType>(defaultType)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(defaultType === 'income' ? 'salary' : 'food')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit')
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')
  const [creditCardId, setCreditCardId] = useState(creditCards[0]?.id || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [installmentCount, setInstallmentCount] = useState(1)

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    setCategory(newType === 'income' ? 'salary' : 'food')
  }

  const reset = () => {
    setType(defaultType)
    setDescription('')
    setAmount('')
    setCategory(defaultType === 'income' ? 'salary' : 'food')
    setPaymentMethod('debit')
    setAccountId(accounts[0]?.id || '')
    setCreditCardId(creditCards[0]?.id || '')
    setDate(new Date().toISOString().split('T')[0])
    setIsRecurring(false)
    setInstallmentCount(1)
  }

  const handleSave = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0 || !description.trim()) return

    const isCredit = type === 'expense' && paymentMethod === 'credit'

    addTransaction(
      {
        type,
        description: description.trim(),
        amount: numAmount,
        category,
        paymentMethod: type === 'income' ? 'debit' : paymentMethod,
        accountId: isCredit ? undefined : (accountId || undefined),
        creditCardId: isCredit ? (creditCardId || undefined) : undefined,
        date: new Date(date).toISOString(),
        status: 'paid',
        isRecurring,
        monthId: currentMonthId || undefined,
      },
      isCredit && installmentCount > 1 ? installmentCount : undefined
    )

    reset()
    onOpenChange(false)
  }

  const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
    { value: 'debit', label: t.paymentMethods.debit },
    { value: 'credit', label: t.paymentMethods.credit },
    { value: 'cash', label: t.paymentMethods.cash },
    { value: 'pix', label: t.paymentMethods.pix },
  ]

  const categoryKeys = CATEGORIES[type === 'income' ? 'income' : 'expense']
  const isCredit = type === 'expense' && paymentMethod === 'credit'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.transactions.addTransaction}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            {(['expense', 'income'] as TransactionType[]).map((tp) => (
              <button
                key={tp}
                onClick={() => handleTypeChange(tp)}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-semibold border transition-all',
                  type === tp
                    ? tp === 'income'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-primary/10 border-primary text-primary'
                    : 'border-border hover:bg-accent text-muted-foreground'
                )}
              >
                {tp === 'expense' ? t.transactions.expense : t.common.income}
              </button>
            ))}
          </div>

          {/* Description + Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.description}</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={type === 'income' ? t.categories.salary : t.categories.food}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.amount}</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.date}</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.category}</label>
            <div className="grid grid-cols-4 gap-1.5">
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
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate w-full text-center leading-tight">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Payment Method (expenses only) */}
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

          {/* Credit card selector */}
          {isCredit && creditCards.length > 0 && (
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

          {/* Installments (credit only) */}
          {isCredit && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t.transactions.installmentCount}</label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                  <button
                    key={n}
                    onClick={() => setInstallmentCount(n)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-sm font-semibold border transition-all',
                      installmentCount === n ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-accent'
                    )}
                  >
                    {n}x
                  </button>
                ))}
              </div>
              {installmentCount > 1 && amount && !isNaN(parseFloat(amount)) && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  {installmentCount}x {t.common.of} {(parseFloat(amount) / installmentCount).toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Account selector (income or non-credit expense) */}
          {!isCredit && accounts.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                {type === 'income' ? t.accounts.title : t.transactions.account}
              </label>
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

          {/* Recurring */}
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded"
            />
            <span>{t.common.recurring}</span>
          </label>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} className="flex-1">{t.common.add}</Button>
            <Button variant="outline" onClick={() => { reset(); onOpenChange(false) }} className="flex-1">{t.common.cancel}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
