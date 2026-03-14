export type PaymentMethod = 'debit' | 'credit' | 'cash' | 'pix'

export type AccountType = 'bank' | 'cash' | 'wallet' | 'digital'

export type TransactionType = 'expense' | 'income'

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
