export const categoryColors: Record<string, string> = {
  food: '#f97316',
  groceries: '#22c55e',
  transport: '#3b82f6',
  health: '#ef4444',
  entertainment: '#8b5cf6',
  housing: '#06b6d4',
  shopping: '#ec4899',
  education: '#f59e0b',
  other: '#6b7280',
}

export function getCategoryColor(category: string): string {
  return categoryColors[category] || categoryColors.other
}
