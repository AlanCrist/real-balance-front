import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, Trash2, TrendingUp, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'

const goalColors = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

export function Goals() {
  const goals = useStore((s) => s.goals)
  const addGoal = useStore((s) => s.addGoal)
  const removeGoal = useStore((s) => s.removeGoal)
  const contributeToGoal = useStore((s) => s.contributeToGoal)
  const { t, locale } = useI18n()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [monthly, setMonthly] = useState('')
  const [contributeId, setContributeId] = useState<string | null>(null)
  const [contributeAmount, setContributeAmount] = useState('')

  const handleAdd = async () => {
    if (!name || !target || !monthly) return
    await addGoal({
      name,
      targetAmount: parseFloat(target),
      currentAmount: 0,
      monthlyTarget: parseFloat(monthly),
      color: goalColors[goals.length % goalColors.length],
    })
    setName('')
    setTarget('')
    setMonthly('')
    setOpen(false)
  }

  const handleContribute = async (id: string) => {
    const amount = parseFloat(contributeAmount)
    if (isNaN(amount) || amount <= 0) return
    await contributeToGoal(id, amount)
    setContributeId(null)
    setContributeAmount('')
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const overallPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.goals.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.goals.subtitle}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              {t.goals.newGoal}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.goals.createGoal}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.goals.goalName}</label>
                <Input placeholder={t.goals.goalNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.goals.targetAmount}</label>
                <Input type="number" placeholder="10000" value={target} onChange={(e) => setTarget(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.goals.monthlyContribution}</label>
                <Input type="number" placeholder="500" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
              </div>
              <Button onClick={handleAdd} className="w-full">{t.goals.createGoal}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total saved hero card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn(
          'relative overflow-hidden border',
          overallPercent >= 100 ? 'animate-glow-success border-emerald-500/30' : 'border-violet-500/20'
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-transparent pointer-events-none" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-12 w-12 rounded-2xl bg-violet-500/15 flex items-center justify-center">
                {overallPercent >= 100
                  ? <Trophy className="h-6 w-6 text-amber-500" />
                  : <Target className="h-6 w-6 text-violet-500" />
                }
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.goals.totalSaved}</p>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalSaved, locale)}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">{t.goals.totalGoal}</p>
                <p className="text-sm font-semibold text-muted-foreground">{formatCurrency(totalTarget, locale)}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Progress
                value={Math.min(overallPercent, 100)}
                indicatorColor={overallPercent >= 80 ? '#22c55e' : '#7c3aed'}
                className="h-3"
              />
              <p className="text-xs text-muted-foreground">
                {overallPercent.toFixed(1)}% {t.goals.ofTotalGoal.split('{')[0]}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goal list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {goals.map((goal, idx) => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
            const remaining = goal.targetAmount - goal.currentAmount
            const monthsLeft = remaining > 0 ? Math.ceil(remaining / goal.monthlyTarget) : 0
            const isComplete = percent >= 100
            const isAlmostDone = percent >= 85 && !isComplete

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
              >
                <Card className={cn(
                  'group border transition-all',
                  isComplete && 'animate-glow-success border-emerald-500/30',
                  isAlmostDone && 'border-violet-500/30'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: goal.color + '20', color: goal.color }}
                        >
                          {isComplete ? <Trophy className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-semibold">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(goal.monthlyTarget, locale)}{t.goals.perMonth}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isComplete ? 'success' : percent >= 50 ? 'secondary' : 'secondary'}>
                          {isComplete ? t.goals.completed : `${percent.toFixed(0)}%`}
                        </Badge>
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <Progress value={percent} indicatorColor={goal.color} className="h-2.5" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatCurrency(goal.currentAmount, locale)} {t.common.of} {formatCurrency(goal.targetAmount, locale)}
                        </span>
                        {monthsLeft > 0 && (
                          <span>{t.common.monthsLeft.replace('{count}', String(monthsLeft))}</span>
                        )}
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {contributeId === goal.id ? (
                        <motion.div
                          key="input"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-2"
                        >
                          <Input
                            type="number"
                            placeholder={t.goals.amount}
                            value={contributeAmount}
                            onChange={(e) => setContributeAmount(e.target.value)}
                            className="h-9"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleContribute(goal.id)
                              if (e.key === 'Escape') setContributeId(null)
                            }}
                          />
                          <Button size="sm" onClick={() => handleContribute(goal.id)}>{t.common.add}</Button>
                          <Button size="sm" variant="ghost" onClick={() => setContributeId(null)}>{t.common.cancel}</Button>
                        </motion.div>
                      ) : (
                        <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 text-xs"
                            onClick={() => setContributeId(goal.id)}
                            disabled={isComplete}
                          >
                            <TrendingUp className="h-3 w-3" />
                            {isComplete ? t.goals.goalReached : t.goals.addContribution}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {goals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-muted-foreground"
        >
          <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-violet-400 opacity-60" />
          </div>
          <p className="font-semibold text-base">{t.goals.noGoals}</p>
          <p className="text-sm mt-1">{t.goals.noGoalsDesc}</p>
        </motion.div>
      )}
    </div>
  )
}
