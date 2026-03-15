import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TransactionList } from '@/components/TransactionList'
import { CreditCardVisual } from '@/components/CreditCardVisual'
import { CreditCardModal } from '@/components/CreditCardModal'
import { useStore } from '@/store/useStore'
import { useI18n } from '@/i18n'
import type { CreditCard } from '@/types'

export function CreditCardPage() {
  const creditCards = useStore((s) => s.creditCards)
  const transactions = useStore((s) => s.transactions)
  const addCreditCard = useStore((s) => s.addCreditCard)
  const updateCreditCard = useStore((s) => s.updateCreditCard)
  const removeCreditCard = useStore((s) => s.removeCreditCard)
  const { t } = useI18n()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)

  const creditTransactions = transactions.filter((tx) => tx.paymentMethod === 'credit')

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
        <div className="space-y-6">
          {creditCards.map((card) => (
            <CreditCardVisual
              key={card.id}
              card={card}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
              showActions
            />
          ))}
        </div>
      )}

      {creditTransactions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.creditCards.creditCardTransactions}</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <TransactionList transactions={creditTransactions} showDelete showEdit />
          </CardContent>
        </Card>
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
