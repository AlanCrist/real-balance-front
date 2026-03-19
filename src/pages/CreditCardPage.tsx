import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCardVisual } from '@/components/CreditCardVisual'
import { CreditCardModal } from '@/components/CreditCardModal'
import { CardStatement } from '@/components/CardStatement'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import type { CreditCard } from '@/types'

export function CreditCardPage() {
  const creditCards = useStore((s) => s.creditCards)
  const addCreditCard = useStore((s) => s.addCreditCard)
  const updateCreditCard = useStore((s) => s.updateCreditCard)
  const removeCreditCard = useStore((s) => s.removeCreditCard)
  const { t } = useI18n()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)

  const handleAddCard = () => {
    setEditingCard(null)
    setIsModalOpen(true)
  }

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card)
    setIsModalOpen(true)
  }

  const handleSaveCard = (cardData: Omit<CreditCard, 'id'>) => {
    if (editingCard) {
      updateCreditCard(editingCard.id, cardData)
    } else {
      addCreditCard(cardData)
    }
    setIsModalOpen(false)
    setEditingCard(null)
  }

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm(t.creditCards.confirmDelete)) {
      removeCreditCard(cardId)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.creditCards.title}</h1>
          <p className="text-sm text-muted-foreground">{t.creditCards.subtitle}</p>
        </div>
        <Button onClick={handleAddCard} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.creditCards.addCard}
        </Button>
      </div>

      {creditCards.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">{t.creditCards.noData}</p>
            <Button onClick={handleAddCard}>{t.creditCards.newCard}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {creditCards.map((card) => (
            <div key={card.id} className="space-y-4">
              <CreditCardVisual
                card={card}
                onEdit={handleEditCard}
                onDelete={handleDeleteCard}
                showActions
              />
              <CardStatement card={card} />
            </div>
          ))}
        </div>
      )}

      <CreditCardModal
        card={editingCard}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveCard}
      />
    </div>
  )
}
