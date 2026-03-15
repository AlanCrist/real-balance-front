import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CreditCard, CardNetwork, CardType } from '@/types'
import { BANK_COLORS, NETWORK_BADGES } from '@/utils/cardBanks'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

interface CreditCardModalProps {
  card: CreditCard | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (card: Omit<CreditCard, 'id'>) => void
}

export function CreditCardModal({ card, open, onOpenChange, onSave }: CreditCardModalProps) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [bank, setBank] = useState('other')
  const [network, setNetwork] = useState<CardNetwork>('visa')
  const [cardType, setCardType] = useState<CardType>('credit')
  const [limit, setLimit] = useState('')
  const [used, setUsed] = useState('')
  const [closingDay, setClosingDay] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [color, setColor] = useState('#3b82f6')

  const getCardTypeLabel = (type: CardType) => {
    if (type === 'credit') return t.creditCards.creditCardType
    if (type === 'debit') return t.creditCards.debitCardType
    return t.creditCards.hybridCardType
  }

  useEffect(() => {
    if (card) {
      setName(card.name)
      setBank(card.bank)
      setNetwork(card.network)
      setCardType(card.cardType)
      setLimit(String(card.limit))
      setUsed(String(card.used))
      setClosingDay(String(card.closingDay))
      setDueDay(String(card.dueDay))
      setColor(card.color)
    } else {
      resetForm()
    }
  }, [card, open])

  const resetForm = () => {
    setName('')
    setBank('other')
    setNetwork('visa')
    setCardType('credit')
    setLimit('')
    setUsed('')
    setClosingDay('')
    setDueDay('')
    setColor('#3b82f6')
  }

  const handleSave = () => {
    if (!name || !limit || !closingDay || !dueDay) return

    onSave({
      name,
      bank,
      network,
      cardType,
      limit: parseFloat(limit),
      used: parseFloat(used) || 0,
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay),
      color,
    })

    resetForm()
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {card ? t.creditCards.editCard : t.creditCards.newCard}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t.creditCards.cardName}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Visa Platinum"
              className="mt-1"
            />
          </div>

          {/* Bank Selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t.creditCards.bank}</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.entries(BANK_COLORS).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setBank(key)}
                  className={cn(
                    'p-3 rounded-lg border-2 text-sm font-medium transition-all',
                    bank === key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          {/* Network Selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t.creditCards.network}</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.entries(NETWORK_BADGES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setNetwork(key as CardNetwork)}
                  className={cn(
                    'p-3 rounded-lg border-2 text-sm font-medium transition-all',
                    network === key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                  style={{
                    color: network === key ? value.color : undefined,
                  }}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          {/* Card Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t.creditCards.cardType}</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['credit', 'debit', 'hybrid'] as CardType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setCardType(type)}
                  className={cn(
                    'p-3 rounded-lg border-2 text-sm font-medium transition-all capitalize',
                    cardType === type
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {getCardTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t.creditCards.limit} ($)</label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="5000"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t.creditCards.used} ($)</label>
              <Input
                type="number"
                value={used}
                onChange={(e) => setUsed(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          {/* Closing and Due Days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t.creditCards.closingDay}</label>
              <Input
                type="number"
                min="1"
                max="31"
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
                placeholder="25"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t.creditCards.dueDay}</label>
              <Input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                placeholder="5"
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {card ? t.creditCards.saveChanges : t.creditCards.createCard}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
