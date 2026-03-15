import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Plus, Trash2, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { formatCurrency } from '@/utils/formatters'

const goalColors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

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

  const handleAdd = () => {
    if (!name || !target || !monthly) return
    addGoal({
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

  const handleContribute = (id: string) => {
    const amount = parseFloat(contributeAmount)
    if (isNaN(amount) || amount <= 0) return
    contributeToGoal(id, amount)
    setContributeId(null)
    setContributeAmount('')
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.goals.title}</h1>
          <p className="text-sm text-muted-foreground">{t.goals.subtitle}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
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
                <Input
                  placeholder={t.goals.goalNamePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.goals.targetAmount}</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t.goals.monthlyContribution}</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                {t.goals.createGoal}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-purple-500/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.goals.totalSaved}</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSaved, locale)}</p>
            </div>
          </div>
          <Progress
            value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}
            className="h-3"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t.goals.ofTotalGoal
              .replace('{percent}', totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : '0')
              .replace('{total}', formatCurrency(totalTarget, locale))}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {goals.map((goal, idx) => {
          const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
          const remaining = goal.targetAmount - goal.currentAmount
          const monthsLeft = remaining > 0 ? Math.ceil(remaining / goal.monthlyTarget) : 0

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Card className="group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: goal.color + '20', color: goal.color }}
                    >
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(goal.monthlyTarget, locale)}{t.goals.perMonth}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={percent >= 100 ? 'success' : 'secondary'}>
                      {percent.toFixed(0)}%
                    </Badge>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Progress value={percent} indicatorColor={goal.color} className="h-2.5 mb-2" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(goal.currentAmount, locale)} {t.common.of} {formatCurrency(goal.targetAmount, locale)}
                  </span>
                  {monthsLeft > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {t.common.monthsLeft.replace('{count}', String(monthsLeft))}
                    </span>
                  )}
                </div>

                {contributeId === goal.id ? (
                  <div className="flex gap-2 mt-3 animate-slide-in">
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
                    <Button size="sm" onClick={() => handleContribute(goal.id)}>
                      {t.common.add}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setContributeId(null)}>
                      {t.common.cancel}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full gap-2 text-xs"
                    onClick={() => setContributeId(goal.id)}
                  >
                    <TrendingUp className="h-3 w-3" />
                    {t.goals.addContribution}
                  </Button>
                )}
              </CardContent>
            </Card>
            </motion.div>
          )
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t.goals.noGoals}</p>
          <p className="text-sm">{t.goals.noGoalsDesc}</p>
        </div>
      )}
    </div>
  )
}
