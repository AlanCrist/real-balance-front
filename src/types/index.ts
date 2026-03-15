export type PaymentMethod = 'debit' | 'credit' | 'cash' | 'pix'

export type AccountType = 'bank' | 'cash' | 'wallet' | 'digital'

export type TransactionType = 'expense' | 'income' | 'transfer'

export type TransactionStatus = 'pending' | 'paid'

export type CardNetwork = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard'

export type CardType = 'credit' | 'debit' | 'hybrid'

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  color: string
  icon: string
}

export interface CreditCard {
  id: string
  name: string
  bank: string
  network: CardNetwork
  cardType: CardType
  limit: number
  used: number
  closingDay: number
  dueDay: number
  color: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface Month {
  id: string
  month: number   // 0–11
  year: number
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category: string
  description: string
  date: string
  paymentMethod: PaymentMethod
  accountId?: string
  creditCardId?: string
  status: TransactionStatus    // NEW: 'pending' | 'paid'
  isRecurring: boolean         // NEW
  monthId?: string             // NEW: links to Month.id
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  monthlyTarget: number
  deadline?: string
  color: string
}

export interface ParsedExpense {
  amount: number
  description: string
  category: string
  paymentMethod: PaymentMethod
  type: TransactionType   // NEW: 'expense' | 'income' | 'transfer'
}

export interface OnboardingData {
  monthlyIncome: number
  creditCardLimit: number
  accounts: Array<{ name: string; type: AccountType; balance: number }>
  completed: boolean
}

export interface MonthlySpending {
  month: string
  amount: number
}
