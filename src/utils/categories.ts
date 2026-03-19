export interface CategoryMeta {
  icon: string
  color: string
}

export const CATEGORIES: {
  all: Record<string, CategoryMeta>
  expense: string[]
  income: string[]
} = {
  all: {
    food:          { icon: '🍽️', color: '#f97316' },
    groceries:     { icon: '🛒', color: '#22c55e' },
    transport:     { icon: '🚗', color: '#3b82f6' },
    health:        { icon: '❤️', color: '#ef4444' },
    entertainment: { icon: '🎬', color: '#a855f7' },
    housing:       { icon: '🏠', color: '#6366f1' },
    shopping:      { icon: '🛍️', color: '#ec4899' },
    education:     { icon: '🎓', color: '#0ea5e9' },
    travel:        { icon: '✈️', color: '#06b6d4' },
    personal_care: { icon: '✨', color: '#f472b6' },
    subscriptions: { icon: '🔄', color: '#8b5cf6' },
    pets:          { icon: '🐾', color: '#d97706' },
    gifts:         { icon: '🎁', color: '#e879f9' },
    taxes:         { icon: '🧾', color: '#64748b' },
    salary:        { icon: '💼', color: '#10b981' },
    freelance:     { icon: '💻', color: '#0d9488' },
    investment:    { icon: '📈', color: '#7c3aed' },
    rental:        { icon: '🏢', color: '#2563eb' },
    other:         { icon: '•••', color: '#6b7280' },
  },
  expense: [
    'food', 'groceries', 'transport', 'health', 'entertainment',
    'housing', 'shopping', 'education', 'travel', 'personal_care',
    'subscriptions', 'pets', 'gifts', 'taxes', 'other',
  ],
  income: [
    'salary', 'freelance', 'investment', 'rental', 'other',
  ],
}
