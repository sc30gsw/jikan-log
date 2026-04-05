type Category = {
  color: string;
  icon?: string;
  name: string;
  sortOrder: number;
};

const MAX_CATEGORY_NAME_LENGTH = 50;

const DEFAULT_CATEGORIES = [
  { color: '#3B82F6', name: 'SNS', sortOrder: 0 },
  { color: '#8B5CF6', name: 'Gaming', sortOrder: 1 },
  { color: '#10B981', name: 'Exercise', sortOrder: 2 },
  { color: '#F59E0B', name: 'Housework', sortOrder: 3 },
  { color: '#EF4444', name: 'Study', sortOrder: 4 },
  { color: '#EC4899', name: 'Events', sortOrder: 5 },
  { color: '#F97316', name: 'Meals', sortOrder: 6 },
  { color: '#6366F1', name: 'Sleep', sortOrder: 7 },
  { color: '#14B8A6', name: 'Work', sortOrder: 8 },
  { color: '#64748B', name: 'Commute', sortOrder: 9 },
  { color: '#9CA3AF', name: 'Other', sortOrder: 10 },
] as const satisfies readonly Category[];

/**
 * Returns the list of default categories.
 */
export function getDefaultCategories(): Category[] {
  return DEFAULT_CATEGORIES.map((c) => ({ ...c }));
}

/**
 * Sorts categories by sortOrder ascending. Does not mutate the input.
 */
export function sortCategories<T extends { sortOrder: number }>(categories: T[]): T[] {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Validates a category name: non-empty, trimmed, max 50 chars.
 */
export function validateCategoryName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_CATEGORY_NAME_LENGTH;
}
