import type { ParsedExpense, PaymentMethod, TransactionType } from '@/types'
import type { Locale } from '@/i18n'

const CATEGORY_KEYWORDS: Record<Locale, Record<string, string>> = {
  en: {
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
  },
  pt: {
    almoço: 'food',
    café: 'food',
    restaurante: 'food',
    comida: 'food',
    lanche: 'food',
    pizza: 'food',
    hambúrguer: 'food',
    sushi: 'food',
    açaí: 'food',
    compras: 'groceries',
    supermercado: 'groceries',
    feira: 'groceries',
    mercado: 'groceries',
    uber: 'transport',
    táxi: 'transport',
    ônibus: 'transport',
    metrô: 'transport',
    gasolina: 'transport',
    combustível: 'transport',
    estacionamento: 'transport',
    pedágio: 'transport',
    academia: 'health',
    farmácia: 'health',
    médico: 'health',
    dentista: 'health',
    remédio: 'health',
    medicamento: 'health',
    netflix: 'entertainment',
    spotify: 'entertainment',
    cinema: 'entertainment',
    filme: 'entertainment',
    jogo: 'entertainment',
    bar: 'entertainment',
    cerveja: 'entertainment',
    aluguel: 'housing',
    luz: 'housing',
    eletricidade: 'housing',
    água: 'housing',
    internet: 'housing',
    telefone: 'housing',
    roupa: 'shopping',
    sapato: 'shopping',
    amazon: 'shopping',
    presente: 'shopping',
    livro: 'education',
    curso: 'education',
    escola: 'education',
  },
  es: {
    almuerzo: 'food',
    desayuno: 'food',
    cena: 'food',
    restaurante: 'food',
    comida: 'food',
    café: 'food',
    pizza: 'food',
    hamburguesa: 'food',
    sushi: 'food',
    aperitivo: 'food',
    comestibles: 'groceries',
    supermercado: 'groceries',
    mercado: 'groceries',
    tienda: 'groceries',
    uber: 'transport',
    taxi: 'transport',
    autobús: 'transport',
    metro: 'transport',
    gasolina: 'transport',
    combustible: 'transport',
    estacionamiento: 'transport',
    peaje: 'transport',
    gimnasio: 'health',
    farmacia: 'health',
    doctor: 'health',
    dentista: 'health',
    medicina: 'health',
    medicamento: 'health',
    netflix: 'entertainment',
    spotify: 'entertainment',
    cine: 'entertainment',
    película: 'entertainment',
    juego: 'entertainment',
    bar: 'entertainment',
    cerveza: 'entertainment',
    alquiler: 'housing',
    electricidad: 'housing',
    agua: 'housing',
    internet: 'housing',
    teléfono: 'housing',
    ropa: 'shopping',
    zapato: 'shopping',
    amazon: 'shopping',
    regalo: 'shopping',
    libro: 'education',
    curso: 'education',
    escuela: 'education',
  },
  fr: {
    déjeuner: 'food',
    petit_déjeuner: 'food',
    dîner: 'food',
    restaurant: 'food',
    nourriture: 'food',
    café: 'food',
    pizza: 'food',
    hamburger: 'food',
    sushi: 'food',
    collation: 'food',
    épicerie: 'groceries',
    supermarché: 'groceries',
    marché: 'groceries',
    magasin: 'groceries',
    uber: 'transport',
    taxi: 'transport',
    bus: 'transport',
    métro: 'transport',
    essence: 'transport',
    carburant: 'transport',
    stationnement: 'transport',
    péage: 'transport',
    salle_de_sport: 'health',
    pharmacie: 'health',
    docteur: 'health',
    dentiste: 'health',
    médicament: 'health',
    netflix: 'entertainment',
    spotify: 'entertainment',
    cinéma: 'entertainment',
    film: 'entertainment',
    jeu: 'entertainment',
    bar: 'entertainment',
    bière: 'entertainment',
    loyer: 'housing',
    électricité: 'housing',
    eau: 'housing',
    internet: 'housing',
    téléphone: 'housing',
    vêtements: 'shopping',
    chaussures: 'shopping',
    amazon: 'shopping',
    cadeau: 'shopping',
    livre: 'education',
    cours: 'education',
    école: 'education',
  },
}

const INCOME_KEYWORDS: Record<Locale, Set<string>> = {
  en: new Set(['salary', 'income', 'freelance', 'payment', 'bonus', 'refund', 'wage']),
  pt: new Set(['salário', 'renda', 'freelance', 'pagamento', 'bônus', 'reembolso', 'ganho', 'lucro']),
  es: new Set(['salario', 'renta', 'freelance', 'pago', 'bonificación', 'reembolso', 'ganancia']),
  fr: new Set(['salaire', 'revenu', 'freelance', 'paiement', 'bonus', 'remboursement', 'gain']),
}

const PAYMENT_KEYWORDS: Record<Locale, Record<string, PaymentMethod>> = {
  en: {
    credit: 'credit',
    card: 'credit',
    debit: 'debit',
    cash: 'cash',
    pix: 'pix',
  },
  pt: {
    crédito: 'credit',
    cartão: 'credit',
    débito: 'debit',
    dinheiro: 'cash',
    pix: 'pix',
  },
  es: {
    crédito: 'credit',
    tarjeta: 'credit',
    débito: 'debit',
    efectivo: 'cash',
    pix: 'pix',
  },
  fr: {
    crédit: 'credit',
    carte: 'credit',
    débit: 'debit',
    espèces: 'cash',
    pix: 'pix',
  },
}

export function parseExpenseInput(input: string, locale: Locale = 'en'): ParsedExpense | null {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return null

  const amountMatch = trimmed.match(/^(\d+(?:[.,]\d{1,2})?)/)
  if (!amountMatch) return null

  const amount = parseFloat(amountMatch[1].replace(',', '.'))
  if (amount <= 0 || isNaN(amount)) return null

  const rest = trimmed.slice(amountMatch[0].length).trim()
  const words = rest.split(/\s+/).filter(Boolean)

  const categoryMap = CATEGORY_KEYWORDS[locale] || CATEGORY_KEYWORDS.en
  const incomeKeywords = INCOME_KEYWORDS[locale] || INCOME_KEYWORDS.en
  const paymentMap = PAYMENT_KEYWORDS[locale] || PAYMENT_KEYWORDS.en

  let paymentMethod: PaymentMethod = 'debit'
  let type: TransactionType = 'expense'
  const descriptionWords: string[] = []

  for (const word of words) {
    if (paymentMap[word]) {
      paymentMethod = paymentMap[word]
    } else if (incomeKeywords.has(word)) {
      type = 'income'
    } else {
      descriptionWords.push(word)
    }
  }

  const description = descriptionWords.join(' ') || (type === 'income' ? 'income' : 'expense')

  let category = 'other'
  for (const word of descriptionWords) {
    if (categoryMap[word]) {
      category = categoryMap[word]
      break
    }
  }

  return { amount, description, category, paymentMethod, type }
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
