/**
 * Supporting tests for calculateDuration utility
 * Used by PROP-002 and PROP-003
 */
import { describe, expect, it } from 'vitest';

import { calculateDuration } from '~/src/features/time-entry/utils/calculate-duration';

describe('calculateDuration', () => {
  it('returns duration in minutes for same-day range', () => {
    const start = new Date(2026, 3, 1, 9, 0);
    const end = new Date(2026, 3, 1, 10, 30);
    expect(calculateDuration(start, end)).toBe(90);
  });

  it('returns 0 for identical times', () => {
    const time = new Date(2026, 3, 1, 9, 0);
    expect(calculateDuration(time, time)).toBe(0);
  });

  it('returns duration for overnight range', () => {
    const start = new Date(2026, 3, 1, 22, 0);
    const end = new Date(2026, 3, 2, 6, 0);
    expect(calculateDuration(start, end)).toBe(480);
  });

  it('returns 15 for a 15-minute interval', () => {
    const start = new Date(2026, 3, 1, 9, 0);
    const end = new Date(2026, 3, 1, 9, 15);
    expect(calculateDuration(start, end)).toBe(15);
  });

  it('returns 0 when end is before start (FIND-006 guard)', () => {
    const start = new Date(2026, 3, 1, 10, 0);
    const end = new Date(2026, 3, 1, 9, 0);
    expect(calculateDuration(start, end)).toBe(0);
  });
});
