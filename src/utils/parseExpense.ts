import type { ParsedExpense, PaymentMethod } from '@/types'

const CATEGORY_MAP: Record<string, string> = {
  lunch: 'food',
  dinner: 'food',
  breakfast: 'food',
  restaurant: 'food',
  food: 'food',
  coffee: 'food',
  snack: 'food',
  pizza: 'food',
  burger: 'food',
  sushi: 'food',
  groceries: 'groceries',
  supermarket: 'groceries',
  market: 'groceries',
  uber: 'transport',
  taxi: 'transport',
  bus: 'transport',
  metro: 'transport',
  gas: 'transport',
  fuel: 'transport',
  parking: 'transport',
  toll: 'transport',
  gym: 'health',
  pharmacy: 'health',
  doctor: 'health',
  dentist: 'health',
  medicine: 'health',
  netflix: 'entertainment',
  spotify: 'entertainment',
  cinema: 'entertainment',
  movie: 'entertainment',
  game: 'entertainment',
  bar: 'entertainment',
  beer: 'entertainment',
  rent: 'housing',
  electricity: 'housing',
  water: 'housing',
  internet: 'housing',
  phone: 'housing',
  clothes: 'shopping',
  shoes: 'shopping',
  amazon: 'shopping',
  gift: 'shopping',
  book: 'education',
  course: 'education',
  school: 'education',
}

const PAYMENT_KEYWORDS: Record<string, PaymentMethod> = {
  credit: 'credit',
  card: 'credit',
  debit: 'debit',
  cash: 'cash',
  pix: 'pix',
}

export function parseExpenseInput(input: string): ParsedExpense | null {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return null

  const amountMatch = trimmed.match(/^(\d+(?:[.,]\d{1,2})?)/)
  if (!amountMatch) return null

  const amount = parseFloat(amountMatch[1].replace(',', '.'))
  if (amount <= 0 || isNaN(amount)) return null

  const rest = trimmed.slice(amountMatch[0].length).trim()
  const words = rest.split(/\s+/).filter(Boolean)

  let paymentMethod: PaymentMethod = 'debit'
  const descriptionWords: string[] = []

  for (const word of words) {
    if (PAYMENT_KEYWORDS[word]) {
      paymentMethod = PAYMENT_KEYWORDS[word]
    } else {
      descriptionWords.push(word)
    }
  }

  const description = descriptionWords.join(' ') || 'expense'

  let category = 'other'
  for (const word of descriptionWords) {
    if (CATEGORY_MAP[word]) {
      category = CATEGORY_MAP[word]
      break
    }
  }

  return { amount, description, category, paymentMethod }
}

export const CATEGORY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  food: { icon: 'UtensilsCrossed', color: '#f97316', label: 'Food' },
  groceries: { icon: 'ShoppingCart', color: '#22c55e', label: 'Groceries' },
  transport: { icon: 'Car', color: '#3b82f6', label: 'Transport' },
  health: { icon: 'Heart', color: '#ef4444', label: 'Health' },
  entertainment: { icon: 'Gamepad2', color: '#8b5cf6', label: 'Entertainment' },
  housing: { icon: 'Home', color: '#06b6d4', label: 'Housing' },
  shopping: { icon: 'ShoppingBag', color: '#ec4899', label: 'Shopping' },
  education: { icon: 'GraduationCap', color: '#f59e0b', label: 'Education' },
  other: { icon: 'Receipt', color: '#6b7280', label: 'Other' },
}
