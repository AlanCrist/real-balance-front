import { useState, useMemo } from 'react'
import { Search, Filter, Plus, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TransactionList } from '@/components/TransactionList'
import { AddTransactionModal } from '@/components/AddTransactionModal'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import type { PaymentMethod, TransactionType } from '@/types'

export function Transactions() {
  const transactions = useStore((s) => s.transactions)
  const accounts = useStore((s) => s.accounts)
  const currentMonthId = useStore((s) => s.currentMonthId)
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all')
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalType, setAddModalType] = useState<TransactionType>('expense')

  const openAdd = (type: TransactionType) => {
    setAddModalType(type)
    setAddModalOpen(true)
  }

  const paymentMethods: Array<{ value: PaymentMethod | 'all'; label: string }> = [
    { value: 'all', label: t.common.all },
    { value: 'debit', label: t.paymentMethods.debit },
    { value: 'credit', label: t.paymentMethods.credit },
    { value: 'cash', label: t.paymentMethods.cash },
    { value: 'pix', label: t.paymentMethods.pix },
  ]

  const categories = useMemo(() => {
    const cats = new Set(transactions.map((tx) => tx.category))
    return ['all', ...Array.from(cats)]
  }, [transactions])

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false
      if (methodFilter !== 'all' && tx.paymentMethod !== methodFilter) return false
      if (accountFilter !== 'all' && tx.accountId !== accountFilter) return false

      if (currentMonthId) {
        if (tx.monthId === currentMonthId) {
          // matches current month
        } else if (tx.monthId === undefined) {
          // fallback to date-based matching
          const txDate = new Date(tx.date)
          const months = useStore.getState().months
          const currentMonth = months.find((m) => m.id === currentMonthId)
          if (!currentMonth || txDate.getMonth() !== currentMonth.month || txDate.getFullYear() !== currentMonth.year) {
            return false
          }
        } else {
          return false
        }
      }

      if (dateFrom) {
        const txDate = new Date(tx.date)
        const fromDate = new Date(dateFrom)
        if (txDate < fromDate) return false
      }

      if (dateTo) {
        const txDate = new Date(tx.date)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (txDate > toDate) return false
      }

      return true
    })
  }, [transactions, search, categoryFilter, methodFilter, accountFilter, dateFrom, dateTo, currentMonthId])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.transactions.title}</h1>
          <p className="text-sm text-muted-foreground">{t.transactions.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/10" onClick={() => openAdd('income')}>
            <TrendingUp className="h-3.5 w-3.5" />
            {t.transactions.addIncome}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => openAdd('expense')}>
            <Plus className="h-3.5 w-3.5" />
            {t.transactions.addExpense}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.transactions.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <Card className="animate-slide-in">
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t.transactions.category}</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                      categoryFilter === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {cat === 'all' ? t.common.all : t.categories[cat as keyof typeof t.categories] || cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t.transactions.paymentMethod}</p>
              <div className="flex flex-wrap gap-1.5">
                {paymentMethods.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setMethodFilter(value)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                      methodFilter === value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t.common.account}</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setAccountFilter('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                    accountFilter === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {t.common.all}
                </button>
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => setAccountFilter(account.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                      accountFilter === account.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {account.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t.common.dateRange}</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">{t.common.from}</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">{t.common.to}</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          {t.transactions.transactionsCount.replace('{count}', String(filtered.length))}
        </Badge>
        {(categoryFilter !== 'all' || methodFilter !== 'all' || accountFilter !== 'all' || dateFrom || dateTo || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setCategoryFilter('all')
              setMethodFilter('all')
              setAccountFilter('all')
              setDateFrom('')
              setDateTo('')
            }}
            className="text-xs"
          >
            {t.common.clearFilters}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-2">
          <TransactionList transactions={filtered} showDelete showEdit />
        </CardContent>
      </Card>

      <AddTransactionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        defaultType={addModalType}
      />
    </div>
  )
}
