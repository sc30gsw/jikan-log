import type { SplitEntry, TimeEntry } from '~/src/features/time-entry/types/time-entry';

function midnightAfter(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + 1);
  return next;
}

function isMidnight(date: Date): boolean {
  return (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function doesNotCrossMidnight(startTime: Date, endTime: Date): boolean {
  return (
    isSameDay(startTime, endTime) ||
    (isMidnight(endTime) && midnightAfter(startTime).getTime() === endTime.getTime())
  );
}

/**
 * Splits a time entry at midnight boundaries for display purposes.
 * If the entry does not cross midnight, returns a single-element array.
 */
export function splitEntryAtMidnight(entry: TimeEntry): SplitEntry[] {
  const { categoryId, endTime, memo, startTime } = entry;

  if (doesNotCrossMidnight(startTime, endTime)) {
    return [{ categoryId, endTime, memo, startTime }];
  }

  const splits: SplitEntry[] = [];
  let currentStart = startTime;

  while (currentStart.getTime() < endTime.getTime()) {
    const midnight = midnightAfter(currentStart);
    const segmentEnd = midnight.getTime() < endTime.getTime() ? midnight : endTime;
    splits.push({ categoryId, endTime: segmentEnd, memo, startTime: currentStart });
    currentStart = segmentEnd;
  }

  return splits;
}
