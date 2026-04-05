/**
 * PROP-004 (REQ-ENTRY-002)
 * Valibot schemas reject invalid input and accept valid input.
 * - timeEntrySchema rejects entries where endTime <= startTime
 * - timeEntrySchema rejects entries with duration < 5 minutes
 * - categorySchema rejects empty names
 */
import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import {
  categorySchema,
  timeEntrySchema,
} from '~/src/features/time-entry/schemas/time-entry-schema';

describe('timeEntrySchema (PROP-004)', () => {
  const validEntry = {
    categoryId: 'cat-study',
    endTime: new Date(2026, 3, 1, 10, 0).toISOString(),
    memo: 'test memo',
    startTime: new Date(2026, 3, 1, 9, 0).toISOString(),
  };

  it('accepts valid time entry', () => {
    expect(() => v.parse(timeEntrySchema, validEntry)).not.toThrow();
  });

  it('rejects entry where endTime <= startTime', () => {
    const invalid = {
      ...validEntry,
      endTime: new Date(2026, 3, 1, 8, 0).toISOString(),
    };
    expect(() => v.parse(timeEntrySchema, invalid)).toThrow();
  });

  it('rejects entry where endTime equals startTime', () => {
    const invalid = {
      ...validEntry,
      endTime: validEntry.startTime,
    };
    expect(() => v.parse(timeEntrySchema, invalid)).toThrow();
  });

  it('rejects entry with duration less than 5 minutes', () => {
    const invalid = {
      ...validEntry,
      endTime: new Date(2026, 3, 1, 9, 4).toISOString(),
    };
    expect(() => v.parse(timeEntrySchema, invalid)).toThrow();
  });

  it('accepts entry with exactly 5 minutes duration', () => {
    const valid = {
      ...validEntry,
      endTime: new Date(2026, 3, 1, 9, 5).toISOString(),
    };
    expect(() => v.parse(timeEntrySchema, valid)).not.toThrow();
  });

  it('accepts entry without memo (optional)', () => {
    const { memo: _memo, ...withoutMemo } = validEntry;
    expect(() => v.parse(timeEntrySchema, withoutMemo)).not.toThrow();
  });

  it('rejects entry without categoryId', () => {
    const { categoryId: _catId, ...withoutCategory } = validEntry;
    expect(() => v.parse(timeEntrySchema, withoutCategory)).toThrow();
  });

  it('rejects entry without startTime', () => {
    const { startTime: _start, ...withoutStart } = validEntry;
    expect(() => v.parse(timeEntrySchema, withoutStart)).toThrow();
  });

  it('rejects entry without endTime', () => {
    const { endTime: _end, ...withoutEnd } = validEntry;
    expect(() => v.parse(timeEntrySchema, withoutEnd)).toThrow();
  });

  it('rejects invalid date strings (FIND-002)', () => {
    const invalid = {
      ...validEntry,
      startTime: 'not-a-date',
    };
    expect(() => v.parse(timeEntrySchema, invalid)).toThrow();
  });
});

describe('categorySchema (PROP-004)', () => {
  it('accepts valid category', () => {
    const valid = {
      color: '#FF5733',
      name: 'Study',
    };
    expect(() => v.parse(categorySchema, valid)).not.toThrow();
  });

  it('rejects empty name', () => {
    const invalid = {
      color: '#FF5733',
      name: '',
    };
    expect(() => v.parse(categorySchema, invalid)).toThrow();
  });

  it('rejects missing name', () => {
    const invalid = {
      color: '#FF5733',
    };
    expect(() => v.parse(categorySchema, invalid)).toThrow();
  });

  it('accepts category with optional icon', () => {
    const valid = {
      color: '#FF5733',
      icon: 'book',
      name: 'Study',
    };
    expect(() => v.parse(categorySchema, valid)).not.toThrow();
  });
});
