import { create } from 'zustand'
import { api } from '@/services/api'
import type { Account, CreditCard, Transaction, Goal, Profile, Month } from '@/types'

interface AppState {
  // Data (loaded from API)
  transactions: Transaction[]
  accounts: Account[]
  creditCards: CreditCard[]
  goals: Goal[]
  months: Month[]
  currentMonthId: string | null
  profile: Profile | null
  theme: 'light' | 'dark'

  // Sync state
  loading: boolean
  error: string | null

  // Init / teardown
  fetchAll: () => Promise<void>
  clearAll: () => void

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>, installmentCount?: number) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>

  // Accounts
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>
  removeAccount: (id: string) => Promise<void>

  // Credit Cards
  addCreditCard: (card: Omit<CreditCard, 'id'>) => Promise<void>
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => Promise<void>
  removeCreditCard: (id: string) => Promise<void>

  // Goals
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  removeGoal: (id: string) => Promise<void>
  contributeToGoal: (id: string, amount: number) => Promise<void>

  // Months
  addMonth: (m: Omit<Month, 'id'>) => Promise<void>
  setCurrentMonth: (id: string | null) => void
  duplicateMonth: (fromMonthId: string, mode: 'all' | 'recurring') => Promise<void>
  loadMonthTransactions: (monthId: string) => Promise<void>

  // Profile
  updateProfile: (data: Partial<Profile>) => Promise<void>
  toggleTheme: () => void

  // Computed getters (read from local state)
  getTotalBalance: () => number
  getTotalCreditUsed: () => number
  getTotalCreditLimit: () => number
  getMonthlySpending: () => number
  getMonthlyIncome: () => number
  getMonthlyFixed: () => number
  getMonthlyVariable: () => number
  getRealBalance: () => number
}

export const useStore = create<AppState>()((set, get) => ({
  transactions: [],
  accounts: [],
  creditCards: [],
  goals: [],
  months: [],
  currentMonthId: null,
  profile: null,
  theme: 'dark',
  loading: false,
  error: null,

  // ---- Init: load everything from API after login ----
  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const [accounts, creditCards, goals, months, profile] = await Promise.all([
        api.getAccounts(),
        api.getCreditCards(),
        api.getGoals(),
        api.getMonths(),
        api.getProfile(),
      ])

      // Find current month
      const now = new Date()
      const currentMonth = months.find(
        (m) => m.month === now.getMonth() && m.year === now.getFullYear()
      )

      // Load transactions for current month (or all if no month exists)
      const txResult = await api.getTransactions(
        currentMonth ? { monthId: currentMonth.id } : undefined
      )

      set({
        accounts,
        creditCards,
        goals,
        months,
        profile,
        transactions: txResult.data,
        currentMonthId: currentMonth?.id ?? null,
        theme: profile?.theme ?? 'dark',
        loading: false,
      })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  clearAll: () =>
    set({
      accounts: [],
      creditCards: [],
      goals: [],
      months: [],
      transactions: [],
      profile: null,
      currentMonthId: null,
      loading: false,
      error: null,
    }),

  // ---- Transactions ----
  addTransaction: async (tx, installmentCount) => {
    const created = await api.createTransaction(tx, installmentCount)
    // Reload accounts and cards to reflect balance changes
    const [accounts, creditCards] = await Promise.all([
      api.getAccounts(),
      api.getCreditCards(),
    ])
    set((state) => ({
      transactions: [...created, ...state.transactions],
      accounts,
      creditCards,
    }))
  },

  removeTransaction: async (id) => {
    await api.deleteTransaction(id)
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }))
  },

  updateTransaction: async (id, updates) => {
    const updated = await api.updateTransaction(id, updates)
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? updated : t)),
    }))
  },

  // ---- Accounts ----
  addAccount: async (account) => {
    const created = await api.createAccount(account)
    set((state) => ({ accounts: [...state.accounts, created] }))
  },

  updateAccount: async (id, updates) => {
    const updated = await api.updateAccount(id, updates)
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? updated : a)),
    }))
  },

  removeAccount: async (id) => {
    await api.deleteAccount(id)
    set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) }))
  },

  // ---- Credit Cards ----
  addCreditCard: async (card) => {
    const created = await api.createCreditCard(card)
    set((state) => ({ creditCards: [...state.creditCards, created] }))
  },

  updateCreditCard: async (id, updates) => {
    const updated = await api.updateCreditCard(id, updates)
    set((state) => ({
      creditCards: state.creditCards.map((c) => (c.id === id ? updated : c)),
    }))
  },

  removeCreditCard: async (id) => {
    await api.deleteCreditCard(id)
    set((state) => ({ creditCards: state.creditCards.filter((c) => c.id !== id) }))
  },

  // ---- Goals ----
  addGoal: async (goal) => {
    const created = await api.createGoal(goal)
    set((state) => ({ goals: [...state.goals, created] }))
  },

  updateGoal: async (id, updates) => {
    const updated = await api.updateGoal(id, updates)
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }))
  },

  removeGoal: async (id) => {
    await api.deleteGoal(id)
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
  },

  contributeToGoal: async (id, amount) => {
    const updated = await api.contributeToGoal(id, amount)
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }))
  },

  // ---- Months ----
  addMonth: async (m) => {
    const created = await api.createMonth(m)
    set((state) => ({ months: [...state.months, created] }))
  },

  setCurrentMonth: (id) => set({ currentMonthId: id }),

  duplicateMonth: async (fromMonthId, mode) => {
    const result = await api.duplicateMonth(fromMonthId, mode)
    // Reload months and transactions
    const months = await api.getMonths()
    const txResult = await api.getTransactions({ monthId: result.monthId })
    set({ months, transactions: txResult.data, currentMonthId: result.monthId })
  },

  loadMonthTransactions: async (monthId) => {
    const txResult = await api.getTransactions({ monthId })
    set({ transactions: txResult.data, currentMonthId: monthId })
  },

  // ---- Profile ----
  updateProfile: async (data) => {
    const updated = await api.updateProfile(data)
    set({ profile: updated })
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark'
    set({ theme: newTheme })
    // Fire and forget — update server in background
    api.updateProfile({ theme: newTheme }).catch(() => {})
  },

  // ---- Computed getters (unchanged — read local state) ----
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
    const state = get()
    return state.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getMonthlyIncome: () => {
    const state = get()
    return state.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getMonthlyFixed: () => {
    const state = get()
    return state.transactions
      .filter((t) => t.type === 'expense' && t.isRecurring)
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getMonthlyVariable: () => {
    const state = get()
    return state.transactions
      .filter((t) => t.type === 'expense' && !t.isRecurring)
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getRealBalance: () => {
    const totalBalance = get().getTotalBalance()
    const totalCreditUsed = get().getTotalCreditUsed()
    return totalBalance - totalCreditUsed
  },
}))
