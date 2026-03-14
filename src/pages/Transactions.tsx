import { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TransactionList } from '@/components/TransactionList'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types'

export function Transactions() {
  const transactions = useStore((s) => s.transactions)
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

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
      return true
    })
  }, [transactions, search, categoryFilter, methodFilter])

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">{t.transactions.title}</h1>
        <p className="text-sm text-muted-foreground">{t.transactions.subtitle}</p>
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
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          {t.transactions.transactionsCount.replace('{count}', String(filtered.length))}
        </Badge>
        {(categoryFilter !== 'all' || methodFilter !== 'all' || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setCategoryFilter('all')
              setMethodFilter('all')
            }}
            className="text-xs"
          >
            {t.common.clearFilters}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-2">
          <TransactionList transactions={filtered} showDelete />
        </CardContent>
      </Card>
    </div>
  )
}
