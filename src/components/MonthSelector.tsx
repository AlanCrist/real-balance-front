import { ChevronDown, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import { NewMonthModal } from './NewMonthModal'
import { cn } from '@/lib/utils'

export function MonthSelector() {
  const [open, setOpen] = useState(false)
  const [showNewMonthModal, setShowNewMonthModal] = useState(false)
  const months = useStore((s) => s.months)
  const currentMonthId = useStore((s) => s.currentMonthId)
  const setCurrentMonth = useStore((s) => s.setCurrentMonth)
  const { t } = useI18n()

  const currentMonth = months.find((m) => m.id === currentMonthId)

  const formatMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1)
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
  }

  return (
    <>
      <div className="relative w-full max-w-xs">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border flex items-center justify-between text-sm font-medium transition-colors',
            open ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent'
          )}
        >
          <span>
            {currentMonth ? formatMonth(currentMonth.month, currentMonth.year) : 'Select Month'}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-50">
            <div className="max-h-[300px] overflow-y-auto space-y-1 p-2">
              {months.map((month) => (
                <button
                  key={month.id}
                  onClick={() => {
                    setCurrentMonth(month.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full px-3 py-2 rounded text-sm text-left transition-colors',
                    month.id === currentMonthId
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  {formatMonth(month.month, month.year)}
                </button>
              ))}
            </div>
            <div className="border-t border-border p-2">
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => {
                  setShowNewMonthModal(true)
                  setOpen(false)
                }}
              >
                <Plus className="h-3 w-3" />
                {t.common.newMonth}
              </Button>
            </div>
          </div>
        )}
      </div>

      <NewMonthModal open={showNewMonthModal} onOpenChange={setShowNewMonthModal} />
    </>
  )
}
