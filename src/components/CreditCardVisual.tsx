import { CreditCard as CreditCardIcon, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { CreditCard } from '@/types'
import { getBankColor, getNetworkBadge } from '@/utils/cardBanks'
import { formatCurrency } from '@/utils/formatters'
import { useI18n } from '@/i18n'

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
  const isHighUsage = usagePercent > 75

  const getCardTypeLabel = (type: string) => {
    if (type === 'credit') return t.creditCards.creditCardType
    if (type === 'debit') return t.creditCards.debitCardType
    return t.creditCards.hybridCardType
  }

  return (
    <div className="space-y-4">
      {/* Visual Card */}
      <div
        className="relative rounded-3xl p-8 text-white overflow-hidden shadow-lg"
        style={{
          background: bankColor.gradient,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4 blur-3xl" />

        <div className="relative z-10 space-y-6">
          {/* Header: Icon and Card Name */}
          <div className="flex items-center justify-between">
            <CreditCardIcon className="h-8 w-8 opacity-80" />
            <span className="text-sm font-semibold opacity-90">{card.name}</span>
          </div>

          {/* Bank and Network Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">{bankColor.name}</p>
              <p className="text-xs opacity-70">
                {getCardTypeLabel(card.cardType)}
              </p>
            </div>
            <div
              className="px-3 py-2 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: networkBadge.bg,
                color: networkBadge.color,
              }}
            >
              {networkBadge.name}
            </div>
          </div>

          {/* Amount and Limit */}
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatCurrency(card.used, locale)}</p>
            <p className="text-sm opacity-80">
              {t.creditCards.of} {formatCurrency(card.limit, locale)}
            </p>
          </div>

          {/* Closing and Due Dates */}
          <div className="flex justify-between text-xs opacity-70 pt-4 border-t border-white/20">
            <span>{t.creditCards.closes}: {card.closingDay}</span>
            <span>{t.creditCards.due}: {card.dueDay}</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.creditCards.used}</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(card.used, locale)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t.creditCards.available}</p>
            <p className="text-lg font-bold text-green-500">{formatCurrency(available, locale)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Usage</p>
            <p className="text-lg font-bold">{usagePercent.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">{t.creditCards.creditLimitUsage}</span>
            <Badge variant={isHighUsage ? 'warning' : 'success'}>
              {usagePercent.toFixed(0)}%
            </Badge>
          </div>
          <Progress
            value={usagePercent}
            indicatorColor={isHighUsage ? 'hsl(var(--warning))' : 'hsl(var(--success))'}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-2">
          {onEdit && (
            <Button
              onClick={() => onEdit(card)}
              variant="outline"
              className="flex-1 gap-2"
            >
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
