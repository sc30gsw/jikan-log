/**
 * PROP-002 (REQ-ENTRY-008, EDGE-001)
 * Midnight splitting preserves total duration.
 * - Sum of split durations === original duration
 * - Output entries are non-overlapping and cover the original range
 */
import { describe, expect, it } from 'vitest';

import type { TimeEntry } from '~/src/features/time-entry/types/time-entry';
import { calculateDuration } from '~/src/features/time-entry/utils/calculate-duration';
import { splitEntryAtMidnight } from '~/src/features/time-entry/utils/split-entry-at-midnight';

function makeEntry(
  startDay: number,
  startHour: number,
  endDay: number,
  endHour: number,
): TimeEntry {
  return {
    categoryId: 'cat-1',
    endTime: new Date(2026, 3, endDay, endHour),
    id: 'entry-1',
    memo: '',
    startTime: new Date(2026, 3, startDay, startHour),
  };
}

describe('splitEntryAtMidnight (PROP-002)', () => {
  it('returns single entry for same-day entry', () => {
    const entry = makeEntry(1, 9, 1, 17);
    const result = splitEntryAtMidnight(entry);
    expect(result).toHaveLength(1);
    expect(result[0].startTime).toEqual(entry.startTime);
    expect(result[0].endTime).toEqual(entry.endTime);
  });

  it('splits entry spanning midnight into two parts', () => {
    const entry = makeEntry(1, 22, 2, 6);
    const result = splitEntryAtMidnight(entry);
    expect(result).toHaveLength(2);
  });

  it('preserves total duration after split', () => {
    const entry = makeEntry(1, 22, 2, 6);
    const originalDuration = calculateDuration(entry.startTime, entry.endTime);
    const result = splitEntryAtMidnight(entry);
    const totalSplitDuration = result.reduce(
      (sum, e) => sum + calculateDuration(e.startTime, e.endTime),
      0,
    );
    expect(totalSplitDuration).toBe(originalDuration);
  });

  it('first split ends at midnight', () => {
    const entry = makeEntry(1, 22, 2, 6);
    const result = splitEntryAtMidnight(entry);
    const midnight = new Date(2026, 3, 2, 0, 0, 0, 0);
    expect(result[0].endTime).toEqual(midnight);
  });

  it('second split starts at midnight', () => {
    const entry = makeEntry(1, 22, 2, 6);
    const result = splitEntryAtMidnight(entry);
    const midnight = new Date(2026, 3, 2, 0, 0, 0, 0);
    expect(result[1].startTime).toEqual(midnight);
  });

  it('splits entry spanning multiple midnights', () => {
    const entry = makeEntry(1, 22, 3, 6);
    const result = splitEntryAtMidnight(entry);
    expect(result).toHaveLength(3);
  });

  it('preserves total duration for multi-day split', () => {
    const entry = makeEntry(1, 22, 3, 6);
    const originalDuration = calculateDuration(entry.startTime, entry.endTime);
    const result = splitEntryAtMidnight(entry);
    const totalSplitDuration = result.reduce(
      (sum, e) => sum + calculateDuration(e.startTime, e.endTime),
      0,
    );
    expect(totalSplitDuration).toBe(originalDuration);
  });

  it('split entries are non-overlapping', () => {
    const entry = makeEntry(1, 22, 3, 6);
    const result = splitEntryAtMidnight(entry);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].endTime.getTime()).toBeLessThanOrEqual(result[i + 1].startTime.getTime());
    }
  });

  it('preserves categoryId and memo in all splits', () => {
    const entry = makeEntry(1, 22, 2, 6);
    entry.categoryId = 'study';
    entry.memo = 'late night study';
    const result = splitEntryAtMidnight(entry);
    for (const split of result) {
      expect(split.categoryId).toBe('study');
      expect(split.memo).toBe('late night study');
    }
  });

  it('handles entry starting exactly at midnight', () => {
    const entry = makeEntry(2, 0, 2, 6);
    const result = splitEntryAtMidnight(entry);
    expect(result).toHaveLength(1);
  });

  it('handles entry ending exactly at midnight', () => {
    const entry = makeEntry(1, 22, 2, 0);
    const result = splitEntryAtMidnight(entry);
    expect(result).toHaveLength(1);
  });
});
