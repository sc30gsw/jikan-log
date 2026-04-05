import * as v from 'valibot';

const MIN_DURATION_MINUTES = 5;

const isoDateString = v.pipe(
  v.string(),
  v.check((s) => !Number.isNaN(Date.parse(s)), 'Must be a valid ISO date string'),
);

export const timeEntrySchema = v.pipe(
  v.object({
    categoryId: v.string(),
    endTime: isoDateString,
    memo: v.optional(v.string()),
    startTime: isoDateString,
  }),
  v.check((input) => {
    const start = new Date(input.startTime).getTime();
    const end = new Date(input.endTime).getTime();
    return end > start;
  }, 'endTime must be after startTime'),
  v.check((input) => {
    const start = new Date(input.startTime).getTime();
    const end = new Date(input.endTime).getTime();
    const durationMinutes = (end - start) / (1000 * 60);
    return durationMinutes >= MIN_DURATION_MINUTES;
  }, `Duration must be at least ${MIN_DURATION_MINUTES} minutes`),
);

export const categorySchema = v.object({
  color: v.string(),
  icon: v.optional(v.string()),
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
});

export type TimeEntryInput = v.InferOutput<typeof timeEntrySchema>;
export type CategoryInput = v.InferOutput<typeof categorySchema>;
