import type { Account, CreditCard, Transaction, Goal, Month, Profile, MonthlySummary } from '@/types'

const STORAGE_KEY = 'rb_mock_db'

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function now(): string {
  return new Date().toISOString()
}

// ---- Seed data ----

const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()

interface MockDb {
  accounts: Account[]
  creditCards: CreditCard[]
  transactions: Transaction[]
  goals: Goal[]
  months: Month[]
  profile: Profile
}

const SEED: MockDb = {
  accounts: [
    { id: 'a1', name: 'Nubank', type: 'digital', balance: 3450.0, color: '#8B5CF6', icon: '🏦' },
    { id: 'a2', name: 'Carteira', type: 'cash', balance: 150.0, color: '#10B981', icon: '💵' },
    { id: 'a3', name: 'Itaú', type: 'bank', balance: 12800.0, color: '#F97316', icon: '🏛️' },
  ],
  creditCards: [
    { id: 'cc1', name: 'Nubank Platinum', bank: 'Nubank', network: 'mastercard', cardType: 'credit', limit: 8000, used: 2340.5, closingDay: 3, dueDay: 10, color: '#8B5CF6' },
    { id: 'cc2', name: 'Itaú Visa', bank: 'Itaú', network: 'visa', cardType: 'credit', limit: 5000, used: 890.0, closingDay: 15, dueDay: 22, color: '#F97316' },
  ],
  transactions: [
    { id: 'tx1', amount: 45.9, type: 'expense', category: 'food', description: 'iFood - Jantar', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-18`, paymentMethod: 'credit', creditCardId: 'cc1', status: 'paid', isRecurring: false, monthId: 'm1' },
    { id: 'tx2', amount: 350.0, type: 'expense', category: 'groceries', description: 'Supermercado Extra', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`, paymentMethod: 'debit', accountId: 'a1', status: 'paid', isRecurring: false, monthId: 'm1' },
    { id: 'tx3', amount: 89.9, type: 'expense', category: 'subscriptions', description: 'Netflix + Spotify', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-05`, paymentMethod: 'credit', creditCardId: 'cc1', status: 'paid', isRecurring: true, monthId: 'm1' },
    { id: 'tx4', amount: 7500.0, type: 'income', category: 'salary', description: 'Salário', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-05`, paymentMethod: 'pix', accountId: 'a3', status: 'paid', isRecurring: true, monthId: 'm1' },
    { id: 'tx5', amount: 1200.0, type: 'expense', category: 'housing', description: 'Aluguel', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-10`, paymentMethod: 'pix', accountId: 'a3', status: 'paid', isRecurring: true, monthId: 'm1' },
    { id: 'tx6', amount: 150.0, type: 'expense', category: 'transport', description: 'Uber / 99', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-12`, paymentMethod: 'credit', creditCardId: 'cc2', status: 'paid', isRecurring: false, monthId: 'm1' },
    { id: 'tx7', amount: 200.0, type: 'expense', category: 'health', description: 'Academia Smart Fit', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`, paymentMethod: 'debit', accountId: 'a1', status: 'paid', isRecurring: true, monthId: 'm1' },
    { id: 'tx8', amount: 2000.0, type: 'income', category: 'freelance', description: 'Projeto freelance', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-20`, paymentMethod: 'pix', accountId: 'a1', status: 'paid', isRecurring: false, monthId: 'm1' },
  ],
  goals: [
    { id: 'g1', name: 'Reserva de emergência', targetAmount: 30000, currentAmount: 12800, monthlyTarget: 1500, deadline: `${currentYear + 1}-06-01`, color: '#10B981' },
    { id: 'g2', name: 'Viagem Europa', targetAmount: 15000, currentAmount: 4200, monthlyTarget: 1000, deadline: `${currentYear + 1}-12-01`, color: '#3B82F6' },
    { id: 'g3', name: 'MacBook novo', targetAmount: 12000, currentAmount: 7500, monthlyTarget: 800, color: '#8B5CF6' },
  ],
  months: [
    { id: 'm1', month: currentMonth, year: currentYear },
    { id: 'm0', month: currentMonth === 0 ? 11 : currentMonth - 1, year: currentMonth === 0 ? currentYear - 1 : currentYear },
  ],
  profile: {
    id: 'p1',
    monthlyIncome: 9500,
    theme: 'dark',
    locale: 'pt',
    onboardingCompleted: true,
  },
}

// ---- DB helpers ----

function loadDb(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  const db = JSON.parse(JSON.stringify(SEED)) as MockDb
  saveDb(db)
  return db
}

function saveDb(db: MockDb): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

function delay(ms = 80): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ---- Mock API (same shape as `api` in api.ts) ----

export const api = {
  // Accounts
  getAccounts: async (): Promise<Account[]> => {
    await delay()
    return loadDb().accounts
  },

  createAccount: async (data: Omit<Account, 'id'>): Promise<Account> => {
    await delay()
    const db = loadDb()
    const account: Account = { id: uid(), ...data }
    db.accounts.push(account)
    saveDb(db)
    return account
  },

  updateAccount: async (id: string, data: Partial<Account>): Promise<Account> => {
    await delay()
    const db = loadDb()
    const idx = db.accounts.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Conta não encontrada')
    db.accounts[idx] = { ...db.accounts[idx], ...data }
    saveDb(db)
    return db.accounts[idx]
  },

  deleteAccount: async (id: string): Promise<void> => {
    await delay()
    const db = loadDb()
    db.accounts = db.accounts.filter((a) => a.id !== id)
    saveDb(db)
  },

  // Transactions
  getTransactions: async (params?: { monthId?: string; type?: string; creditCardId?: string }): Promise<{ data: Transaction[]; count: number }> => {
    await delay()
    const db = loadDb()
    let txs = db.transactions
    if (params?.monthId) txs = txs.filter((t) => t.monthId === params.monthId)
    if (params?.type) txs = txs.filter((t) => t.type === params.type)
    if (params?.creditCardId) txs = txs.filter((t) => t.creditCardId === params.creditCardId)
    return { data: txs, count: txs.length }
  },

  createTransaction: async (data: Omit<Transaction, 'id'> & { installmentCount?: number }, installmentCount?: number): Promise<Transaction[]> => {
    await delay()
    const db = loadDb()
    const count = installmentCount || (data as Record<string, unknown>).installmentCount as number || 1
    const created: Transaction[] = []

    for (let i = 0; i < count; i++) {
      const tx: Transaction = {
        id: uid(),
        ...data,
        installments: count > 1 ? { total: count, current: i + 1, parentId: i === 0 ? undefined : created[0]?.id } : undefined,
      }
      delete (tx as Record<string, unknown>).installmentCount
      created.push(tx)
      db.transactions.push(tx)
    }

    // Update account/card balances
    if (data.accountId && data.type === 'expense') {
      const acc = db.accounts.find((a) => a.id === data.accountId)
      if (acc) acc.balance -= data.amount * count
    }
    if (data.accountId && data.type === 'income') {
      const acc = db.accounts.find((a) => a.id === data.accountId)
      if (acc) acc.balance += data.amount * count
    }
    if (data.creditCardId) {
      const card = db.creditCards.find((c) => c.id === data.creditCardId)
      if (card) card.used += data.amount * count
    }

    saveDb(db)
    return created
  },

  updateTransaction: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    await delay()
    const db = loadDb()
    const idx = db.transactions.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Transação não encontrada')
    db.transactions[idx] = { ...db.transactions[idx], ...data }
    saveDb(db)
    return db.transactions[idx]
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await delay()
    const db = loadDb()
    db.transactions = db.transactions.filter((t) => t.id !== id)
    saveDb(db)
  },

  // Credit Cards
  getCreditCards: async (): Promise<CreditCard[]> => {
    await delay()
    return loadDb().creditCards
  },

  createCreditCard: async (data: Omit<CreditCard, 'id'>): Promise<CreditCard> => {
    await delay()
    const db = loadDb()
    const card: CreditCard = { id: uid(), ...data }
    db.creditCards.push(card)
    saveDb(db)
    return card
  },

  updateCreditCard: async (id: string, data: Partial<CreditCard>): Promise<CreditCard> => {
    await delay()
    const db = loadDb()
    const idx = db.creditCards.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Cartão não encontrado')
    db.creditCards[idx] = { ...db.creditCards[idx], ...data }
    saveDb(db)
    return db.creditCards[idx]
  },

  deleteCreditCard: async (id: string): Promise<void> => {
    await delay()
    const db = loadDb()
    db.creditCards = db.creditCards.filter((c) => c.id !== id)
    saveDb(db)
  },

  // Goals
  getGoals: async (): Promise<Goal[]> => {
    await delay()
    return loadDb().goals
  },

  createGoal: async (data: Omit<Goal, 'id'>): Promise<Goal> => {
    await delay()
    const db = loadDb()
    const goal: Goal = { id: uid(), ...data }
    db.goals.push(goal)
    saveDb(db)
    return goal
  },

  updateGoal: async (id: string, data: Partial<Goal>): Promise<Goal> => {
    await delay()
    const db = loadDb()
    const idx = db.goals.findIndex((g) => g.id === id)
    if (idx === -1) throw new Error('Meta não encontrada')
    db.goals[idx] = { ...db.goals[idx], ...data }
    saveDb(db)
    return db.goals[idx]
  },

  deleteGoal: async (id: string): Promise<void> => {
    await delay()
    const db = loadDb()
    db.goals = db.goals.filter((g) => g.id !== id)
    saveDb(db)
  },

  contributeToGoal: async (id: string, amount: number): Promise<Goal> => {
    await delay()
    const db = loadDb()
    const goal = db.goals.find((g) => g.id === id)
    if (!goal) throw new Error('Meta não encontrada')
    goal.currentAmount += amount
    saveDb(db)
    return goal
  },

  // Months
  getMonths: async (): Promise<Month[]> => {
    await delay()
    return loadDb().months
  },

  createMonth: async (data: { month: number; year: number }): Promise<Month> => {
    await delay()
    const db = loadDb()
    const month: Month = { id: uid(), ...data }
    db.months.push(month)
    saveDb(db)
    return month
  },

  duplicateMonth: async (id: string, mode: 'all' | 'recurring'): Promise<{ monthId: string }> => {
    await delay()
    const db = loadDb()
    const source = db.months.find((m) => m.id === id)
    if (!source) throw new Error('Mês não encontrado')

    const nextMonth = source.month === 11 ? 0 : source.month + 1
    const nextYear = source.month === 11 ? source.year + 1 : source.year
    const newMonth: Month = { id: uid(), month: nextMonth, year: nextYear }
    db.months.push(newMonth)

    const sourceTxs = db.transactions.filter((t) => t.monthId === id)
    const toDuplicate = mode === 'recurring' ? sourceTxs.filter((t) => t.isRecurring) : sourceTxs

    for (const tx of toDuplicate) {
      db.transactions.push({ ...tx, id: uid(), monthId: newMonth.id })
    }

    saveDb(db)
    return { monthId: newMonth.id }
  },

  getMonthlySummary: async (id: string): Promise<MonthlySummary> => {
    await delay()
    const db = loadDb()
    const txs = db.transactions.filter((t) => t.monthId === id)
    return {
      totalIncome: txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      totalExpenses: txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      fixedExpenses: txs.filter((t) => t.type === 'expense' && t.isRecurring).reduce((s, t) => s + t.amount, 0),
      variableExpenses: txs.filter((t) => t.type === 'expense' && !t.isRecurring).reduce((s, t) => s + t.amount, 0),
      transactionCount: txs.length,
    }
  },

  // Profile
  getProfile: async (): Promise<Profile> => {
    await delay()
    return loadDb().profile
  },

  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    await delay()
    const db = loadDb()
    db.profile = { ...db.profile, ...data }
    saveDb(db)
    return db.profile
  },
}
