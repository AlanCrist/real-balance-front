import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'

interface NewMonthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewMonthModal({ open, onOpenChange }: NewMonthModalProps) {
  const months = useStore((s) => s.months)
  const addMonth = useStore((s) => s.addMonth)
  const duplicateMonth = useStore((s) => s.duplicateMonth)
  const { t } = useI18n()

  const lastMonth = months.length > 0 ? months[months.length - 1] : null

  const handleCreateEmpty = () => {
    if (!lastMonth) return
    const nextMonth = (lastMonth.month + 1) % 12
    const nextYear = lastMonth.month === 11 ? lastMonth.year + 1 : lastMonth.year
    addMonth({ month: nextMonth, year: nextYear })
    onOpenChange(false)
  }

  const handleDuplicateAll = () => {
    if (!lastMonth) return
    duplicateMonth(lastMonth.id, 'all')
    onOpenChange(false)
  }

  const handleDuplicateRecurring = () => {
    if (!lastMonth) return
    duplicateMonth(lastMonth.id, 'recurring')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.common.newMonth}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <button
            onClick={handleCreateEmpty}
            className="w-full p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left text-sm font-medium"
          >
            {t.common.emptyMonth}
          </button>

          {lastMonth && (
            <>
              <button
                onClick={handleDuplicateAll}
                className="w-full p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left text-sm font-medium"
              >
                {t.common.duplicateAll}
              </button>

              <button
                onClick={handleDuplicateRecurring}
                className="w-full p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left text-sm font-medium"
              >
                {t.common.duplicateRecurring}
              </button>
            </>
          )}

          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
