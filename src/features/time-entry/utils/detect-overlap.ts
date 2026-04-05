import type { TimeRange } from '~/src/features/time-entry/types/time-entry';

/**
 * Returns true if two time ranges overlap (exclusive of touching endpoints).
 * Adjacent ranges (a.endTime === b.startTime) are NOT considered overlapping.
 */
export function detectOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.startTime.getTime() < b.endTime.getTime() && b.startTime.getTime() < a.endTime.getTime();
}
