import { calculateDuration } from '~/src/features/time-entry/utils/calculate-duration';

type TimeEntry = {
  categoryId: string;
  endTime: Date;
  id: string;
  startTime: Date;
};

type PieSlice = {
  categoryId: string;
  minutes: number;
  percentage: number;
};

type BarItem = {
  categoryId: string;
  minutes: number;
};

type ChartPeriod = 'cumulative' | 'daily' | 'weekly';

/**
 * Aggregates total minutes per category from a list of time entries.
 */
export function aggregateByCategory(entries: TimeEntry[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const entry of entries) {
    const minutes = calculateDuration(entry.startTime, entry.endTime);
    const current = result.get(entry.categoryId) ?? 0;
    result.set(entry.categoryId, current + minutes);
  }
  return result;
}

/**
 * Builds pie chart data with percentages based on total time.
 */
export function buildPieChartData(entries: TimeEntry[]): PieSlice[] {
  if (entries.length === 0) return [];

  const aggregated = aggregateByCategory(entries);
  const total = Array.from(aggregated.values()).reduce((sum, v) => sum + v, 0);

  if (total === 0) return [];

  return Array.from(aggregated.entries())
    .map(([categoryId, minutes]) => ({
      categoryId,
      minutes,
      percentage: (minutes / total) * 100,
    }))
    .sort((a, b) => a.categoryId.localeCompare(b.categoryId));
}

/**
 * Builds bar chart data sorted by category.
 */
export function buildBarChartData(entries: TimeEntry[]): BarItem[] {
  const aggregated = aggregateByCategory(entries);
  return Array.from(aggregated.entries())
    .map(([categoryId, minutes]) => ({ categoryId, minutes }))
    .sort((a, b) => a.categoryId.localeCompare(b.categoryId));
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Clips a time entry to fit within a date range.
 * Returns the clipped entry, or null if no overlap.
 */
function clipEntryToRange(entry: TimeEntry, rangeStart: Date, rangeEnd: Date): TimeEntry | null {
  const entryStart = entry.startTime.getTime();
  const entryEnd = entry.endTime.getTime();
  const rStart = rangeStart.getTime();
  const rEnd = rangeEnd.getTime();

  if (entryEnd <= rStart || entryStart > rEnd) return null;

  return {
    ...entry,
    endTime: new Date(Math.min(entryEnd, rEnd)),
    startTime: new Date(Math.max(entryStart, rStart)),
  };
}

/**
 * Filters and clips entries by period.
 * Cross-midnight entries are clipped so each day only counts its portion (EDGE-001).
 */
export function filterByPeriod(
  entries: TimeEntry[],
  period: ChartPeriod,
  referenceDate: Date,
): TimeEntry[] {
  if (period === 'cumulative') return [...entries];

  const rangeStart = startOfDay(referenceDate);
  const rangeEnd =
    period === 'daily' ? endOfDay(referenceDate) : endOfDay(addDays(referenceDate, 6));

  return entries
    .map((e) => clipEntryToRange(e, rangeStart, rangeEnd))
    .filter((e): e is TimeEntry => e !== null);
}
