import { describe, it, expect } from 'vitest';
import { toISOFullDateString } from '../toISOFullDateString';

describe('toISOFullDateString', () => {
  it('returns YYYY-MM-DD for a UTC date', () => {
    const date = new Date('2024-03-20T15:30:00Z');
    const result = toISOFullDateString(date);
    expect(result).toBe('2024-03-20');
  });

  it('strips time component and preserves date portion', () => {
    const date = new Date('1999-12-31T23:59:59.999Z');
    const result = toISOFullDateString(date);
    expect(result).toBe('1999-12-31');
  });
});
