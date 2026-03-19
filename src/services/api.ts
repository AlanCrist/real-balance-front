import { supabase } from '@/lib/supabase'
import type { Account, CreditCard, Transaction, Goal, Month, Profile, MonthlySummary } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ---- snake_case <-> camelCase converters ----

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function convertKeys<T>(obj: unknown, converter: (key: string) => string): T {
  if (Array.isArray(obj)) return obj.map((item) => convertKeys(item, converter)) as T
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        converter(key),
        convertKeys(value, converter),
      ])
    ) as T
  }
  return obj as T
}

function toApi<T>(obj: T): unknown {
  return convertKeys(obj, toSnakeCase)
}

function fromApi<T>(obj: unknown): T {
  return convertKeys(obj, toCamelCase)
}

// ---- Core fetch wrapper ----

async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return session.access_token
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (res.status === 204) return undefined as T

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error ${res.status}`)
  }

  const json = await res.json()
  return fromApi<T>(json)
}

// ---- Typed API methods ----

export const api = {
  // Accounts
  getAccounts: () =>
    request<Account[]>('/api/accounts'),
  createAccount: (data: Omit<Account, 'id'>) =>
    request<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(toApi(data)) }),
  updateAccount: (id: string, data: Partial<Account>) =>
    request<Account>(`/api/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(toApi(data)) }),
  deleteAccount: (id: string) =>
    request<void>(`/api/accounts/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: (params?: { monthId?: string; type?: string; creditCardId?: string }) => {
    const query = new URLSearchParams()
    if (params?.monthId) query.set('month_id', params.monthId)
    if (params?.type) query.set('type', params.type)
    if (params?.creditCardId) query.set('credit_card_id', params.creditCardId)
    const qs = query.toString()
    return request<{ data: Transaction[]; count: number }>(`/api/transactions${qs ? `?${qs}` : ''}`)
  },
  createTransaction: (data: Omit<Transaction, 'id'>, installmentCount?: number) =>
    request<Transaction[]>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(toApi({ ...data, installmentCount: installmentCount || 1 })),
    }),
  updateTransaction: (id: string, data: Partial<Transaction>) =>
    request<Transaction>(`/api/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(toApi(data)) }),
  deleteTransaction: (id: string) =>
    request<void>(`/api/transactions/${id}`, { method: 'DELETE' }),

  // Credit Cards
  getCreditCards: () =>
    request<CreditCard[]>('/api/credit-cards'),
  createCreditCard: (data: Omit<CreditCard, 'id'>) =>
    request<CreditCard>('/api/credit-cards', { method: 'POST', body: JSON.stringify(toApi(data)) }),
  updateCreditCard: (id: string, data: Partial<CreditCard>) =>
    request<CreditCard>(`/api/credit-cards/${id}`, { method: 'PATCH', body: JSON.stringify(toApi(data)) }),
  deleteCreditCard: (id: string) =>
    request<void>(`/api/credit-cards/${id}`, { method: 'DELETE' }),

  // Goals
  getGoals: () =>
    request<Goal[]>('/api/goals'),
  createGoal: (data: Omit<Goal, 'id'>) =>
    request<Goal>('/api/goals', { method: 'POST', body: JSON.stringify(toApi(data)) }),
  updateGoal: (id: string, data: Partial<Goal>) =>
    request<Goal>(`/api/goals/${id}`, { method: 'PATCH', body: JSON.stringify(toApi(data)) }),
  deleteGoal: (id: string) =>
    request<void>(`/api/goals/${id}`, { method: 'DELETE' }),
  contributeToGoal: (id: string, amount: number) =>
    request<Goal>(`/api/goals/${id}/contribute`, { method: 'POST', body: JSON.stringify({ amount }) }),

  // Months
  getMonths: () =>
    request<Month[]>('/api/months'),
  createMonth: (data: { month: number; year: number }) =>
    request<Month>('/api/months', { method: 'POST', body: JSON.stringify(data) }),
  duplicateMonth: (id: string, mode: 'all' | 'recurring') =>
    request<{ monthId: string }>(`/api/months/${id}/duplicate`, { method: 'POST', body: JSON.stringify({ mode }) }),
  getMonthlySummary: (id: string) =>
    request<MonthlySummary>(`/api/months/${id}/summary`),

  // Profile
  getProfile: () =>
    request<Profile>('/api/profile'),
  updateProfile: (data: Partial<Profile>) =>
    request<Profile>('/api/profile', { method: 'PATCH', body: JSON.stringify(toApi(data)) }),
}
