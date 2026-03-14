import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Account, CreditCard, Transaction, Goal, OnboardingData } from '@/types'
import { generateId } from '@/utils/formatters'

interface AppState {
  transactions: Transaction[]
  accounts: Account[]
  creditCards: CreditCard[]
  goals: Goal[]
  onboarding: OnboardingData
  theme: 'light' | 'dark'

  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  removeTransaction: (id: string) => void

  addAccount: (account: Omit<Account, 'id'>) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  removeAccount: (id: string) => void

  addCreditCard: (card: Omit<CreditCard, 'id'>) => void
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => void

  addGoal: (goal: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  removeGoal: (id: string) => void
  contributeToGoal: (id: string, amount: number) => void

  setOnboarding: (data: Partial<OnboardingData>) => void
  completeOnboarding: () => void
  toggleTheme: () => void

  getTotalBalance: () => number
  getTotalCreditUsed: () => number
  getTotalCreditLimit: () => number
  getMonthlySpending: () => number
  getRealBalance: () => number
}

const defaultAccounts: Account[] = [
  { id: '1', name: 'Main Bank', type: 'bank', balance: 3500, color: '#3b82f6', icon: 'Building2' },
  { id: '2', name: 'Cash', type: 'cash', balance: 200, color: '#22c55e', icon: 'Banknote' },
  { id: '3', name: 'Digital Wallet', type: 'digital', balance: 450, color: '#8b5cf6', icon: 'Smartphone' },
]

const defaultCreditCards: CreditCard[] = [
  { id: '1', name: 'Visa Platinum', limit: 5000, used: 1240, closingDay: 25, dueDay: 5, color: '#3b82f6' },
]

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

const defaultTransactions: Transaction[] = [
  { id: '1', amount: 35, type: 'expense', category: 'food', description: 'lunch', date: new Date(currentYear, currentMonth, now.getDate()).toISOString(), paymentMethod: 'debit', accountId: '1' },
  { id: '2', amount: 120, type: 'expense', category: 'groceries', description: 'weekly groceries', date: new Date(currentYear, currentMonth, now.getDate() - 1).toISOString(), paymentMethod: 'credit', creditCardId: '1' },
  { id: '3', amount: 25, type: 'expense', category: 'transport', description: 'uber ride', date: new Date(currentYear, currentMonth, now.getDate() - 1).toISOString(), paymentMethod: 'debit', accountId: '1' },
  { id: '4', amount: 15, type: 'expense', category: 'entertainment', description: 'netflix', date: new Date(currentYear, currentMonth, now.getDate() - 2).toISOString(), paymentMethod: 'credit', creditCardId: '1' },
  { id: '5', amount: 60, type: 'expense', category: 'health', description: 'pharmacy', date: new Date(currentYear, currentMonth, now.getDate() - 3).toISOString(), paymentMethod: 'debit', accountId: '1' },
  { id: '6', amount: 85, type: 'expense', category: 'shopping', description: 'new shoes', date: new Date(currentYear, currentMonth, now.getDate() - 4).toISOString(), paymentMethod: 'credit', creditCardId: '1' },
  { id: '7', amount: 42, type: 'expense', category: 'food', description: 'dinner with friends', date: new Date(currentYear, currentMonth, now.getDate() - 5).toISOString(), paymentMethod: 'debit', accountId: '2' },
  { id: '8', amount: 200, type: 'expense', category: 'housing', description: 'electricity bill', date: new Date(currentYear, currentMonth, now.getDate() - 6).toISOString(), paymentMethod: 'debit', accountId: '1' },
  { id: '9', amount: 3500, type: 'income', category: 'other', description: 'salary', date: new Date(currentYear, currentMonth, 1).toISOString(), paymentMethod: 'debit', accountId: '1' },
  { id: '10', amount: 30, type: 'expense', category: 'transport', description: 'gas station', date: new Date(currentYear, currentMonth, now.getDate() - 7).toISOString(), paymentMethod: 'debit', accountId: '1' },
]

const defaultGoals: Goal[] = [
  { id: '1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 3200, monthlyTarget: 500, color: '#3b82f6' },
  { id: '2', name: 'Vacation Trip', targetAmount: 3000, currentAmount: 800, monthlyTarget: 300, deadline: new Date(currentYear, currentMonth + 6, 1).toISOString(), color: '#8b5cf6' },
]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: defaultTransactions,
      accounts: defaultAccounts,
      creditCards: defaultCreditCards,
      goals: defaultGoals,
      onboarding: { monthlyIncome: 3500, creditCardLimit: 5000, accounts: [], completed: true },
      theme: 'dark',

      addTransaction: (tx) =>
        set((state) => {
          const newTx = { ...tx, id: generateId() }
          if (tx.type === 'expense' && tx.paymentMethod !== 'credit' && tx.accountId) {
            const accounts = state.accounts.map((a) =>
              a.id === tx.accountId ? { ...a, balance: a.balance - tx.amount } : a
            )
            return { transactions: [newTx, ...state.transactions], accounts }
          }
          if (tx.type === 'expense' && tx.paymentMethod === 'credit' && tx.creditCardId) {
            const creditCards = state.creditCards.map((c) =>
              c.id === tx.creditCardId ? { ...c, used: c.used + tx.amount } : c
            )
            return { transactions: [newTx, ...state.transactions], creditCards }
          }
          if (tx.type === 'income' && tx.accountId) {
            const accounts = state.accounts.map((a) =>
              a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount } : a
            )
            return { transactions: [newTx, ...state.transactions], accounts }
          }
          return { transactions: [newTx, ...state.transactions] }
        }),

      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, { ...account, id: generateId() }],
        })),

      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      removeAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),

      addCreditCard: (card) =>
        set((state) => ({
          creditCards: [...state.creditCards, { ...card, id: generateId() }],
        })),

      updateCreditCard: (id, updates) =>
        set((state) => ({
          creditCards: state.creditCards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, { ...goal, id: generateId() }],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      removeGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      contributeToGoal: (id, amount) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
          ),
        })),

      setOnboarding: (data) =>
        set((state) => ({
          onboarding: { ...state.onboarding, ...data },
        })),

      completeOnboarding: () =>
        set((state) => ({
          onboarding: { ...state.onboarding, completed: true },
        })),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      getTotalBalance: () => {
        return get().accounts.reduce((sum, a) => sum + a.balance, 0)
      },

      getTotalCreditUsed: () => {
        return get().creditCards.reduce((sum, c) => sum + c.used, 0)
      },

      getTotalCreditLimit: () => {
        return get().creditCards.reduce((sum, c) => sum + c.limit, 0)
      },

      getMonthlySpending: () => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return get()
          .transactions.filter(
            (t) => t.type === 'expense' && new Date(t.date) >= startOfMonth
          )
          .reduce((sum, t) => sum + t.amount, 0)
      },

      getRealBalance: () => {
        const totalBalance = get().getTotalBalance()
        const totalCreditUsed = get().getTotalCreditUsed()
        return totalBalance - totalCreditUsed
      },
    }),
    {
      name: 'real-balance-storage',
    }
  )
)
