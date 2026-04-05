/**
 * Calculates duration in minutes between two Date objects.
 * Returns 0 if end is before or equal to start (guard against negative values).
 */
export function calculateDuration(start: Date, end: Date): number {
  const diff = (end.getTime() - start.getTime()) / (1000 * 60);
  return Math.max(0, diff);
}
