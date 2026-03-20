import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Lock, TrendingUp } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useI18n, type Locale } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'

function AnimatedValue({ value, locale, className }: { value: number; locale: Locale; className?: string }) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = prevValue.current
    const end = value
    const duration = 700
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (end - start) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        prevValue.current = end
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])

  return <span className={className}>{formatCurrency(display, locale)}</span>
}

const summaryCards = [
  {
    key: 'income',
    icon: ArrowDownLeft,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    key: 'fixed',
    icon: Lock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    key: 'variable',
    icon: TrendingUp,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    key: 'projected',
    icon: ArrowUpRight,
    getColor: (v: number) => v >= 0 ? 'text-emerald-500' : 'text-red-500',
    getBg: (v: number) => v >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    getBorder: (v: number) => v >= 0 ? 'border-emerald-500/20' : 'border-red-500/20 animate-pulse-warning',
  },
]

export function MonthlySummary() {
  const getMonthlyIncome = useStore((s) => s.getMonthlyIncome)
  const getMonthlyFixed = useStore((s) => s.getMonthlyFixed)
  const getMonthlyVariable = useStore((s) => s.getMonthlyVariable)
  const { t, locale } = useI18n()

  const income = getMonthlyIncome()
  const fixed = getMonthlyFixed()
  const variable = getMonthlyVariable()
  const projected = income - (fixed + variable)

  const data = [
    { label: t.dashboard.monthlyIncome, value: income, key: 'income' },
    { label: t.dashboard.fixedExpenses, value: fixed, key: 'fixed' },
    { label: t.dashboard.variableExpenses, value: variable, key: 'variable' },
    { label: t.dashboard.projectedBalance, value: projected, key: 'projected' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {data.map((item, idx) => {
        const conf = summaryCards[idx]
        const Icon = conf.icon
        const color = 'getColor' in conf ? conf.getColor!(item.value) : conf.color!
        const bg = 'getBg' in conf ? conf.getBg!(item.value) : conf.bgColor!
        const border = 'getBorder' in conf ? conf.getBorder!(item.value) : conf.borderColor!

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className={cn('p-4 rounded-xl border bg-card/80', bg, border)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('h-6 w-6 rounded-md flex items-center justify-center', bg)}>
                <Icon className={cn('h-3.5 w-3.5', color)} />
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-tight">{item.label}</p>
            </div>
            <AnimatedValue
              value={item.value}
              locale={locale}
              className={cn('text-xl font-bold block tabular-nums', color)}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
