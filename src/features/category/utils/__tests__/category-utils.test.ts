/**
 * PROP-025 (REQ-CAT-001, REQ-CAT-002, REQ-CAT-003) - Category CRUD support utils
 * PROP-021 (EDGE-005) - Fallback category behavior
 */
import { describe, expect, it } from 'vitest';

import {
  getDefaultCategories,
  sortCategories,
  validateCategoryName,
} from '~/src/features/category/utils/category-utils';

describe('getDefaultCategories (PROP-025, REQ-CAT-001)', () => {
  it('returns all expected default categories', () => {
    const categories = getDefaultCategories();
    const names = categories.map((c) => c.name);
    expect(names).toContain('SNS');
    expect(names).toContain('Gaming');
    expect(names).toContain('Exercise');
    expect(names).toContain('Housework');
    expect(names).toContain('Study');
    expect(names).toContain('Events');
    expect(names).toContain('Meals');
    expect(names).toContain('Sleep');
    expect(names).toContain('Work');
    expect(names).toContain('Commute');
    expect(names).toContain('Other');
  });

  it('returns exactly 11 default categories', () => {
    const categories = getDefaultCategories();
    expect(categories).toHaveLength(11);
  });

  it('each category has a name, color, and sortOrder', () => {
    const categories = getDefaultCategories();
    for (const cat of categories) {
      expect(cat.name).toBeTruthy();
      expect(cat.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(typeof cat.sortOrder).toBe('number');
    }
  });

  it('includes "Other" as the last category (EDGE-005 fallback)', () => {
    const categories = getDefaultCategories();
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    expect(sorted[sorted.length - 1].name).toBe('Other');
  });
});

describe('sortCategories (PROP-026, REQ-CAT-006)', () => {
  it('sorts categories by sortOrder ascending', () => {
    const categories = [
      { color: '#000', name: 'C', sortOrder: 3 },
      { color: '#000', name: 'A', sortOrder: 1 },
      { color: '#000', name: 'B', sortOrder: 2 },
    ];
    const sorted = sortCategories(categories);
    expect(sorted.map((c) => c.name)).toEqual(['A', 'B', 'C']);
  });

  it('does not mutate the original array', () => {
    const categories = [
      { color: '#000', name: 'B', sortOrder: 2 },
      { color: '#000', name: 'A', sortOrder: 1 },
    ];
    const original = [...categories];
    sortCategories(categories);
    expect(categories).toEqual(original);
  });
});

describe('validateCategoryName', () => {
  it('returns true for non-empty name', () => {
    expect(validateCategoryName('Study')).toBe(true);
  });

  it('returns false for empty name', () => {
    expect(validateCategoryName('')).toBe(false);
  });

  it('returns false for whitespace-only name', () => {
    expect(validateCategoryName('   ')).toBe(false);
  });

  it('returns false for name exceeding 50 characters', () => {
    expect(validateCategoryName('a'.repeat(51))).toBe(false);
  });

  it('returns true for name with exactly 50 characters', () => {
    expect(validateCategoryName('a'.repeat(50))).toBe(true);
  });
});
