/**
 * PROP-001 (REQ-ENTRY-007)
 * Overlap detection is correct and complete.
 * - detectOverlap(a, b) returns true iff time ranges intersect
 * - Symmetry: detectOverlap(a, b) === detectOverlap(b, a)
 * - Reflexivity: detectOverlap(a, a) === true
 */
import { describe, expect, it } from 'vitest';

import type { TimeRange } from '~/src/features/time-entry/types/time-entry';
import { detectOverlap } from '~/src/features/time-entry/utils/detect-overlap';

function makeRange(startHour: number, endHour: number, day = 1): TimeRange {
  return {
    endTime: new Date(2026, 3, day, endHour),
    startTime: new Date(2026, 3, day, startHour),
  };
}

describe('detectOverlap (PROP-001)', () => {
  it('returns true for overlapping ranges', () => {
    const a = makeRange(9, 11);
    const b = makeRange(10, 12);
    expect(detectOverlap(a, b)).toBe(true);
  });

  it('returns false for non-overlapping ranges', () => {
    const a = makeRange(9, 10);
    const b = makeRange(11, 12);
    expect(detectOverlap(a, b)).toBe(false);
  });

  it('returns false for adjacent ranges (end === start)', () => {
    const a = makeRange(9, 10);
    const b = makeRange(10, 11);
    expect(detectOverlap(a, b)).toBe(false);
  });

  it('returns true when one range contains the other', () => {
    const a = makeRange(8, 14);
    const b = makeRange(10, 12);
    expect(detectOverlap(a, b)).toBe(true);
  });

  it('is symmetric: detectOverlap(a, b) === detectOverlap(b, a)', () => {
    const a = makeRange(9, 11);
    const b = makeRange(10, 12);
    expect(detectOverlap(a, b)).toBe(detectOverlap(b, a));
  });

  it('is symmetric for non-overlapping ranges', () => {
    const a = makeRange(9, 10);
    const b = makeRange(11, 12);
    expect(detectOverlap(a, b)).toBe(detectOverlap(b, a));
  });

  it('is reflexive: detectOverlap(a, a) === true', () => {
    const a = makeRange(9, 11);
    expect(detectOverlap(a, a)).toBe(true);
  });

  it('returns true for partially overlapping ranges at start', () => {
    const a = makeRange(8, 10);
    const b = makeRange(9, 11);
    expect(detectOverlap(a, b)).toBe(true);
  });

  it('handles same start time with different end times', () => {
    const a = makeRange(9, 11);
    const b = makeRange(9, 12);
    expect(detectOverlap(a, b)).toBe(true);
  });

  it('handles same end time with different start times', () => {
    const a = makeRange(9, 12);
    const b = makeRange(10, 12);
    expect(detectOverlap(a, b)).toBe(true);
  });
});
