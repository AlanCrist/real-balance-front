import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency, formatMonthShort } from '@/utils/formatters'

export function MonthlyChart() {
  const transactions = useStore((s) => s.transactions)
  const { locale } = useI18n()

  const data = useMemo(() => {
    const now = new Date()
    const months: { month: string; amount: number }[] = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = formatMonthShort(d, locale)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)

      const total = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            new Date(t.date) >= start &&
            new Date(t.date) <= end
        )
        .reduce((sum, t) => sum + t.amount, 0)

      months.push({ month: monthName, amount: total })
    }

    return months
  }, [transactions, locale])

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="month"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => formatCurrency(v, locale).replace(/[.,]\d{2}$/, '')}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="rounded-lg border bg-card p-2 shadow-md">
                <p className="text-sm font-medium">{formatCurrency(payload[0].value as number, locale)}</p>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="hsl(221, 83%, 53%)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorSpending)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function CategoryChart() {
  const transactions = useStore((s) => s.transactions)
  const { t, locale } = useI18n()

  const data = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)

    const categoryTotals: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'expense' && new Date(t.date) >= start)
      .forEach((tx) => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount
      })

    const colors: Record<string, string> = {
      food: '#f97316', groceries: '#22c55e', transport: '#3b82f6', health: '#ef4444',
      entertainment: '#8b5cf6', housing: '#06b6d4', shopping: '#ec4899', education: '#f59e0b',
      other: '#6b7280',
    }

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name: t.categories[name as keyof typeof t.categories] || name,
        value,
        color: colors[name] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, t])

  if (data.length === 0) {
    return <p className="text-center text-muted-foreground text-sm py-8">{t.transactions.noExpensesThisMonth}</p>
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={35}
            outerRadius={55}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {data.slice(0, 4).map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium">{formatCurrency(item.value, locale)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
