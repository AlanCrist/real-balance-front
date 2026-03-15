import { Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CreditCard, Transaction } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { useI18n } from '@/i18n'

interface CreditCardInvoiceSummaryProps {
  card: CreditCard
  transactions: Transaction[]
}

export function CreditCardInvoiceSummary({ card, transactions }: CreditCardInvoiceSummaryProps) {
  const { locale, t } = useI18n()

  // Filter transactions for this card
  const cardTransactions = transactions.filter(
    (tx) => tx.paymentMethod === 'credit' && tx.creditCardId === card.id && tx.type === 'expense'
  )

  // Calculate current invoice (from last closing day to today)
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Determine closing date - find the most recent closing day
  let closingDate = new Date(currentYear, currentMonth, card.closingDay)
  if (closingDate > now) {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    closingDate = new Date(prevYear, prevMonth, Math.min(card.closingDay, 28))
  }

  // Determine due date
  const daysDiff = Math.max(1, card.dueDay - card.closingDay)
  const dueDate = new Date(closingDate)
  dueDate.setDate(dueDate.getDate() + daysDiff)

  // Calculate next closing date
  const nextClosingMonth = closingDate.getMonth() === 11 ? 0 : closingDate.getMonth() + 1
  const nextClosingYear = closingDate.getMonth() === 11 ? closingDate.getFullYear() + 1 : closingDate.getFullYear()
  const nextClosingDate = new Date(nextClosingYear, nextClosingMonth, Math.min(card.closingDay, 28))

  // Current invoice: transactions between last closing and next closing
  const currentInvoiceAmount = cardTransactions
    .filter((tx) => {
      const txDate = new Date(tx.date)
      return txDate >= closingDate && txDate < nextClosingDate
    })
    .reduce((sum, tx) => sum + tx.amount, 0)

  // Next invoice: transactions between next closing and following closing
  const followingClosingMonth = nextClosingMonth === 11 ? 0 : nextClosingMonth + 1
  const followingClosingYear = nextClosingMonth === 11 ? nextClosingYear + 1 : nextClosingYear
  const followingClosingDate = new Date(followingClosingYear, followingClosingMonth, Math.min(card.closingDay, 28))

  const nextInvoiceAmount = cardTransactions
    .filter((tx) => {
      const txDate = new Date(tx.date)
      return txDate >= nextClosingDate && txDate < followingClosingDate
    })
    .reduce((sum, tx) => sum + tx.amount, 0)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">{t.creditCards.currentInvoice}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-bold">{formatCurrency(currentInvoiceAmount, locale)}</p>
          <p className="text-xs text-muted-foreground">
            {t.creditCards.closesOnThe.replace('{day}', nextClosingDate.getDate().toString())}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.creditCards.dueOnThe.replace('{day}', dueDate.getDate().toString())}
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
        <CardContent className="space-y-2">
          <p className="text-2xl font-bold text-muted-foreground">
            {formatCurrency(nextInvoiceAmount, locale)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.creditCards.willCloseOn} {formatDate(new Date(nextClosingDate.getFullYear(), nextClosingDate.getMonth() + 1, card.closingDay))}
          </p>
          <p className="text-xs text-muted-foreground">
            {nextInvoiceAmount > 0 ? t.creditCards.estimatedExpenses : t.creditCards.estimatedActivity}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
