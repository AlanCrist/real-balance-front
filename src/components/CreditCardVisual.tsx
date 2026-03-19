import { CreditCard as CreditCardIcon, Edit2, Trash2, AlertTriangle, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { CreditCard } from '@/types'
import { getBankColor, getNetworkBadge } from '@/utils/cardBanks'
import { formatCurrency } from '@/utils/formatters'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

interface CreditCardVisualProps {
  card: CreditCard
  onEdit?: (card: CreditCard) => void
  onDelete?: (cardId: string) => void
  showActions?: boolean
}

export function CreditCardVisual({ card, onEdit, onDelete, showActions = false }: CreditCardVisualProps) {
  const { locale, t } = useI18n()
  const bankColor = getBankColor(card.bank)
  const networkBadge = getNetworkBadge(card.network)
  const usagePercent = Math.min((card.used / card.limit) * 100, 100)
  const available = card.limit - card.used
  const isCritical = usagePercent > 90
  const isHighUsage = usagePercent > 75

  const getCardTypeLabel = (type: string) => {
    if (type === 'credit') return t.creditCards.creditCardType
    if (type === 'debit') return t.creditCards.debitCardType
    return t.creditCards.hybridCardType
  }

  const getRiskColor = () => {
    if (isCritical) return '#ef4444'
    if (isHighUsage) return '#f59e0b'
    return '#22c55e'
  }

  return (
    <div className="space-y-4">
      {/* Critical usage banner */}
      {isCritical && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="animate-pulse-danger flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/40 text-red-600 dark:text-red-400 text-sm font-medium"
        >
          <Zap className="h-4 w-4 flex-shrink-0" />
          <span>{t.creditCards.limitAlmostExhausted.replace('{percent}', usagePercent.toFixed(0))}</span>
        </motion.div>
      )}

      {/* Visual Card */}
      <motion.div
        animate={isCritical ? {
          boxShadow: [
            '0 0 0 0 rgba(239,68,68,0)',
            '0 0 0 8px rgba(239,68,68,0.2)',
            '0 0 0 0 rgba(239,68,68,0)',
          ]
        } : isHighUsage ? {
          boxShadow: [
            '0 0 0 0 rgba(245,158,11,0)',
            '0 0 0 6px rgba(245,158,11,0.15)',
            '0 0 0 0 rgba(245,158,11,0)',
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative rounded-3xl overflow-hidden shadow-xl"
        style={{ background: bankColor.gradient }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4 blur-3xl pointer-events-none" />

        {/* Risk overlay shimmer for critical */}
        {isCritical && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-0 bg-red-500/8"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}

        <div className="relative z-10 p-8 space-y-6 text-white">
          {/* Header */}
          <div className="flex items-center justify-between">
            <CreditCardIcon className="h-8 w-8 opacity-80" />
            <div className="flex items-center gap-2">
              {isHighUsage && (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <AlertTriangle className={cn('h-4 w-4', isCritical ? 'text-red-300' : 'text-amber-300')} />
                </motion.div>
              )}
              <span className="text-sm font-semibold opacity-90">{card.name}</span>
            </div>
          </div>

          {/* Bank and Network */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">{bankColor.name}</p>
              <p className="text-xs opacity-70">{getCardTypeLabel(card.cardType)}</p>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: networkBadge.bg, color: networkBadge.color }}
            >
              {networkBadge.name}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">{formatCurrency(card.used, locale)}</p>
            <p className="text-sm opacity-80">
              {t.creditCards.of} {formatCurrency(card.limit, locale)}
            </p>
          </div>

          {/* Usage mini bar */}
          <div className="space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getRiskColor() }}
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="flex justify-between text-xs opacity-70 pt-2 border-t border-white/20">
            <span>{t.creditCards.closes}: {card.closingDay}</span>
            <span>{t.creditCards.due}: {card.dueDay}</span>
          </div>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-destructive/20">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.creditCards.used}</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(card.used, locale)}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.creditCards.available}</p>
            <p className="text-lg font-bold text-emerald-500">{formatCurrency(available, locale)}</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'border',
            isCritical ? 'animate-pulse-danger border-red-400/50' : isHighUsage ? 'animate-pulse-warning border-amber-400/40' : 'border-border'
          )}
        >
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.creditCards.usageLabel}</p>
            <p
              className={cn(
                'text-lg font-bold',
                isCritical ? 'text-red-500' : isHighUsage ? 'text-amber-500' : 'text-emerald-500'
              )}
            >
              {usagePercent.toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress */}
      <Card className={cn(isCritical && 'animate-pulse-danger', isHighUsage && !isCritical && 'animate-pulse-warning')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">{t.creditCards.creditLimitUsage}</span>
            <Badge
              variant={isCritical ? 'destructive' : isHighUsage ? 'warning' : 'success'}
            >
              {isCritical ? '⚠️ ' : ''}{usagePercent.toFixed(0)}%
            </Badge>
          </div>
          <Progress
            value={usagePercent}
            indicatorColor={isCritical ? 'hsl(var(--destructive))' : isHighUsage ? 'hsl(var(--warning))' : 'hsl(var(--success))'}
          />
          {isHighUsage && (
            <p className={cn(
              'text-xs mt-2 font-medium',
              isCritical ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'
            )}>
              {isCritical
                ? t.creditCards.criticalUsageWarning
                : t.creditCards.highUsageWarning}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          {onEdit && (
            <Button onClick={() => onEdit(card)} variant="outline" className="flex-1 gap-2">
              <Edit2 className="h-4 w-4" />
              {t.creditCards.edit}
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(card.id)}
              variant="outline"
              className="flex-1 gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {t.creditCards.deleteCard}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
