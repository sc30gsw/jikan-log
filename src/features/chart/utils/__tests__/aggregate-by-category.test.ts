/**
 * PROP-003 (REQ-CHART-001, REQ-CHART-002)
 * Chart aggregation preserves total time.
 * - sum(aggregateByCategory(entries)) === sum(entries.map(duration))
 * - No time is lost or duplicated during aggregation
 */
import { describe, expect, it } from 'vitest';

import {
  aggregateByCategory,
  buildBarChartData,
  buildPieChartData,
  filterByPeriod,
} from '~/src/features/chart/utils/aggregate-by-category';

type TimeEntry = {
  categoryId: string;
  endTime: Date;
  id: string;
  startTime: Date;
};

function makeEntry(
  id: string,
  categoryId: string,
  startHour: number,
  endHour: number,
  day = 1,
): TimeEntry {
  return {
    categoryId,
    endTime: new Date(2026, 3, day, endHour),
    id,
    startTime: new Date(2026, 3, day, startHour),
  };
}

describe('aggregateByCategory (PROP-003)', () => {
  it('aggregates time by category', () => {
    const entries = [
      makeEntry('1', 'study', 9, 11),
      makeEntry('2', 'exercise', 11, 12),
      makeEntry('3', 'study', 14, 16),
    ];
    const result = aggregateByCategory(entries);
    expect(result.get('study')).toBe(240); // 2h + 2h = 240min
    expect(result.get('exercise')).toBe(60); // 1h = 60min
  });

  it('preserves total time (no time lost or duplicated)', () => {
    const entries = [
      makeEntry('1', 'study', 9, 11),
      makeEntry('2', 'exercise', 11, 12),
      makeEntry('3', 'meals', 12, 13),
    ];
    const result = aggregateByCategory(entries);
    const totalAggregated = Array.from(result.values()).reduce((sum, v) => sum + v, 0);
    // Total should be 4 hours = 240 minutes
    expect(totalAggregated).toBe(240);
  });

  it('returns empty map for no entries', () => {
    const result = aggregateByCategory([]);
    expect(result.size).toBe(0);
  });

  it('handles single entry', () => {
    const entries = [makeEntry('1', 'study', 9, 10)];
    const result = aggregateByCategory(entries);
    expect(result.get('study')).toBe(60);
  });
});

describe('buildPieChartData (PROP-003)', () => {
  it('returns pie chart data with correct percentages for a full day', () => {
    const entries = [makeEntry('1', 'study', 0, 12), makeEntry('2', 'exercise', 12, 24)];
    const result = buildPieChartData(entries);
    expect(result).toHaveLength(2);
    const studySlice = result.find((s) => s.categoryId === 'study');
    const exerciseSlice = result.find((s) => s.categoryId === 'exercise');
    expect(studySlice?.percentage).toBeCloseTo(50, 0);
    expect(exerciseSlice?.percentage).toBeCloseTo(50, 0);
  });

  it('preserves total time in pie chart (PROP-003 invariant)', () => {
    const entries = [
      makeEntry('1', 'study', 9, 11),
      makeEntry('2', 'exercise', 11, 12),
      makeEntry('3', 'meals', 12, 13),
    ];
    const result = buildPieChartData(entries);
    const totalMinutes = result.reduce((sum, s) => sum + s.minutes, 0);
    expect(totalMinutes).toBe(240);
    const totalPercentage = result.reduce((sum, s) => sum + s.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 1);
  });

  it('returns empty array for no entries', () => {
    const result = buildPieChartData([]);
    expect(result).toEqual([]);
  });
});

describe('buildBarChartData (PROP-003)', () => {
  it('returns bar chart data with exact category count and sorted', () => {
    const entries = [makeEntry('1', 'study', 9, 11), makeEntry('2', 'exercise', 11, 12)];
    const result = buildBarChartData(entries);
    expect(result).toHaveLength(2);
    expect(result[0].categoryId).toBe('exercise');
    expect(result[1].categoryId).toBe('study');
  });

  it('preserves total time in bar chart (PROP-003 invariant)', () => {
    const entries = [makeEntry('1', 'study', 9, 11), makeEntry('2', 'exercise', 11, 12)];
    const result = buildBarChartData(entries);
    const totalMinutes = result.reduce((sum, b) => sum + b.minutes, 0);
    expect(totalMinutes).toBe(180);
  });

  it('includes minutes for each category', () => {
    const entries = [makeEntry('1', 'study', 9, 11)];
    const result = buildBarChartData(entries);
    const studyBar = result.find((b) => b.categoryId === 'study');
    expect(studyBar?.minutes).toBe(120);
  });
});

describe('filterByPeriod (PROP-003)', () => {
  it('filters entries for a single day', () => {
    const entries = [
      makeEntry('1', 'study', 9, 11, 1),
      makeEntry('2', 'exercise', 11, 12, 2),
      makeEntry('3', 'meals', 12, 13, 1),
    ];
    const targetDate = new Date(2026, 3, 1);
    const result = filterByPeriod(entries, 'daily', targetDate);
    expect(result).toHaveLength(2);
  });

  it('filters entries for a week', () => {
    const entries = [
      makeEntry('1', 'study', 9, 11, 1),
      makeEntry('2', 'exercise', 11, 12, 5),
      makeEntry('3', 'meals', 12, 13, 10),
    ];
    const weekStart = new Date(2026, 3, 1);
    const result = filterByPeriod(entries, 'weekly', weekStart);
    expect(result).toHaveLength(2);
  });

  it('returns all entries for cumulative period', () => {
    const entries = [
      makeEntry('1', 'study', 9, 11, 1),
      makeEntry('2', 'exercise', 11, 12, 15),
      makeEntry('3', 'meals', 12, 13, 30),
    ];
    const result = filterByPeriod(entries, 'cumulative', new Date());
    expect(result).toHaveLength(3);
  });

  it('clips cross-midnight entries to the selected day (EDGE-001, FIND-003)', () => {
    // Entry from 22:00 day 1 to 06:00 day 2
    const crossMidnight: TimeEntry = {
      categoryId: 'study',
      endTime: new Date(2026, 3, 2, 6, 0),
      id: 'cross',
      startTime: new Date(2026, 3, 1, 22, 0),
    };
    // Filter for day 1: should get 22:00-23:59:59 portion
    const day1Result = filterByPeriod([crossMidnight], 'daily', new Date(2026, 3, 1));
    expect(day1Result).toHaveLength(1);
    expect(day1Result[0].startTime).toEqual(new Date(2026, 3, 1, 22, 0));

    // Filter for day 2: should get 00:00-06:00 portion
    const day2Result = filterByPeriod([crossMidnight], 'daily', new Date(2026, 3, 2));
    expect(day2Result).toHaveLength(1);
    expect(day2Result[0].endTime).toEqual(new Date(2026, 3, 2, 6, 0));
  });
});
