import { describe, it, expect } from 'vitest';
import { toISODateTimeString } from '../toISODateTimeString';

describe('toISODateTimeString', () => {
  it('returns ISO 8601 without milliseconds and ends with Z', () => {
    const date = new Date('2024-03-20T15:30:45.123Z');
    const result = toISODateTimeString(date);
    expect(result).toBe('2024-03-20T15:30:45Z');
  });

  it('accepts a Date created from full-date string (YYYY-MM-DD)', () => {
    const date = new Date('2024-03-20');
    const result = toISODateTimeString(date);
    expect(result).toBe('2024-03-20T00:00:00Z');
  });

  it('normalizes offset inputs to UTC', () => {
    const date = new Date('1999-12-31T23:59:59.999-05:00');
    const result = toISODateTimeString(date);
    expect(result).toBe('2000-01-01T04:59:59Z');
  });
});
