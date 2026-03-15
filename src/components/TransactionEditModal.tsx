import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import type { Transaction } from '@/types'

interface TransactionEditModalProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionEditModal({ transaction, open, onOpenChange }: TransactionEditModalProps) {
  const [description, setDescription] = useState(transaction?.description || '')
  const [amount, setAmount] = useState(String(transaction?.amount || ''))
  const [status, setStatus] = useState(transaction?.status || 'pending')
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring || false)
  const updateTransaction = useStore((s) => s.updateTransaction)
  const { t } = useI18n()

  const handleSave = () => {
    if (!transaction) return
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    updateTransaction(transaction.id, {
      description: description || transaction.description,
      amount: numAmount,
      status,
      isRecurring,
    })
    onOpenChange(false)
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.transactions.editTransaction}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Amount</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={status === 'paid'}
                onChange={(e) => setStatus(e.target.checked ? 'paid' : 'pending')}
              />
              <span>{t.common.paid}</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
              <span>{t.common.recurring}</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {t.common.save}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
