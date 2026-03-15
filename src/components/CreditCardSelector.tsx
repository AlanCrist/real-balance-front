import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CreditCard } from '@/types'
import { getBankColor, getNetworkBadge } from '@/utils/cardBanks'
import { formatCurrency } from '@/utils/formatters'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

interface CreditCardSelectorProps {
  cards: CreditCard[]
  selectedCardId?: string
  onSelect: (cardId: string | undefined) => void
  showAvailable?: boolean
}

export function CreditCardSelector({
  cards,
  selectedCardId,
  onSelect,
  showAvailable = true,
}: CreditCardSelectorProps) {
  const { locale, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const selectedCard = cards.find((c) => c.id === selectedCardId)
  const bankColor = selectedCard ? getBankColor(selectedCard.bank) : null

  return (
    <div className="relative w-full">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className={cn(
          'w-full justify-between gap-2',
          selectedCard && 'bg-accent/50'
        )}
      >
        {selectedCard ? (
          <div className="flex items-center gap-2 flex-1 text-left">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: bankColor?.primary }}
            />
            <span className="font-medium">{selectedCard.name}</span>
            {showAvailable && (
              <span className="text-xs text-muted-foreground ml-auto">
                {formatCurrency(selectedCard.limit - selectedCard.used, locale)} {t.creditCards.available}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{t.creditCards.selectCard}</span>
        )}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
            <button
              onClick={() => {
                onSelect(undefined)
                setIsOpen(false)
              }}
              className={cn(
                'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                !selectedCardId
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-accent'
              )}
            >
              {t.creditCards.noSpecificCard}
            </button>

            {cards.map((card) => {
              const bank = getBankColor(card.bank)
              const network = getNetworkBadge(card.network)
              const available = card.limit - card.used
              const usagePercent = Math.min((card.used / card.limit) * 100, 100)

              return (
                <button
                  key={card.id}
                  onClick={() => {
                    onSelect(card.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-3 py-3 rounded-lg border transition-all',
                    card.id === selectedCardId
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{card.name}</span>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{
                        backgroundColor: network.bg,
                        color: network.color,
                      }}
                    >
                      {network.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{bank.name}</span>
                    <span>
                      {usagePercent.toFixed(0)}% {t.creditCards.used} • {formatCurrency(available, locale)} {t.creditCards.available}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
