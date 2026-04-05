/**
 * SSoT type definitions for time entry domain.
 */
export type TimeRange = {
  endTime: Date;
  startTime: Date;
};

export type TimeEntry = TimeRange & {
  categoryId: string;
  id: string;
  memo: string;
};

export type SplitEntry = TimeRange & {
  categoryId: string;
  memo: string;
};
