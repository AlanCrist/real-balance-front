import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Flame, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

export function StreakCounter() {
  const transactions = useStore((s) => s.transactions)
  const { t } = useI18n()

  const { currentStreak, maxStreak, loggedToday } = useMemo(() => {
    const expenseDates = new Set<string>()
    transactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const date = new Date(tx.date).toISOString().split('T')[0]
        expenseDates.add(date)
      })

    const today = new Date().toISOString().split('T')[0]
    const hasToday = expenseDates.has(today)

    if (expenseDates.size === 0) {
      return { currentStreak: 0, maxStreak: 0, loggedToday: false }
    }

    const sortedDates = Array.from(expenseDates).sort().reverse()
    const daysSinceLast = Math.floor(
      (new Date(today).getTime() - new Date(sortedDates[0]).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLast > 1) {
      return { currentStreak: 0, maxStreak: calcMaxStreak(sortedDates), loggedToday: hasToday }
    }

    const startDate = hasToday ? today : sortedDates[0]
    const startMs = new Date(startDate).getTime()
    let current = 0

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(startMs - i * 86400000).toISOString().split('T')[0]
      if (expenseDates.has(checkDate)) current++
      else break
    }

    return {
      currentStreak: current,
      maxStreak: Math.max(current, calcMaxStreak(sortedDates)),
      loggedToday: hasToday,
    }
  }, [transactions])

  const tier = currentStreak >= 30 ? 'legendary' : currentStreak >= 15 ? 'hot' : currentStreak >= 5 ? 'warm' : 'cold'

  const tierConfig = {
    legendary: {
      flameColor: 'text-amber-400',
      glow: 'shadow-[0_0_24px_rgba(251,146,60,0.4)]',
      gradient: 'from-amber-500/15 via-orange-500/10 to-transparent',
      label: `🔥 ${t.streak.legendary}`,
    },
    hot: {
      flameColor: 'text-orange-500',
      glow: 'shadow-[0_0_16px_rgba(249,115,22,0.25)]',
      gradient: 'from-orange-500/10 to-transparent',
      label: t.streak.hot,
    },
    warm: {
      flameColor: 'text-orange-400',
      glow: 'shadow-[0_0_10px_rgba(251,146,60,0.15)]',
      gradient: 'from-orange-400/8 to-transparent',
      label: t.streak.warm,
    },
    cold: {
      flameColor: 'text-muted-foreground',
      glow: '',
      gradient: '',
      label: currentStreak === 0 ? t.streak.startToday : t.streak.keepGoing,
    },
  }

  const config = tierConfig[tier]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative flex items-center gap-4 rounded-2xl border bg-card px-4 py-3.5 overflow-hidden',
        config.glow
      )}
    >
      {/* Background gradient */}
      {config.gradient && (
        <div className={cn('absolute inset-0 bg-gradient-to-r pointer-events-none', config.gradient)} />
      )}

      {/* Flame icon */}
      <motion.div
        animate={currentStreak > 0 ? { scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
        className="relative z-10 flex-shrink-0"
      >
        <Flame className={cn('h-9 w-9', config.flameColor)} />
        {tier !== 'cold' && (
          <motion.div
            className="absolute -inset-1 rounded-full bg-orange-400/20 blur-md"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Text */}
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <motion.span
            key={currentStreak}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold tabular-nums"
          >
            {currentStreak}
          </motion.span>
          <span className="text-sm text-muted-foreground">{t.streak.days.replace('{count}', '')}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{config.label}</p>
      </div>

      {/* Right side */}
      <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
        {loggedToday && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </motion.div>
        )}
        {maxStreak > currentStreak && maxStreak >= 5 && (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground leading-tight">{t.streak.recordLabel}</p>
            <p className="text-xs font-bold tabular-nums">{maxStreak}d</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function calcMaxStreak(sortedDatesDesc: string[]): number {
  if (sortedDatesDesc.length === 0) return 0
  const sorted = [...sortedDatesDesc].reverse()
  let max = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.floor(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff === 1) { current++; max = Math.max(max, current) }
    else current = 1
  }
  return max
}
