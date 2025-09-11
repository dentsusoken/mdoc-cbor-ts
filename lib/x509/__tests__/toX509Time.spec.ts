import { describe, it, expect } from 'vitest';
import { pad, getX509Year, toX509Time } from '../toX509Time';

describe('pad', () => {
  it('should pad single digit numbers with leading zero', () => {
    expect(pad(1)).toBe('01');
    expect(pad(5)).toBe('05');
    expect(pad(9)).toBe('09');
  });

  it('should not pad double digit numbers', () => {
    expect(pad(10)).toBe('10');
    expect(pad(25)).toBe('25');
    expect(pad(99)).toBe('99');
  });

  it('should handle zero', () => {
    expect(pad(0)).toBe('00');
  });
});

describe('getX509Year', () => {
  it('should return 2-digit year for years 1950-2049', () => {
    expect(getX509Year(new Date('1950-01-01T00:00:00Z'))).toBe('50');
    expect(getX509Year(new Date('1999-12-31T23:59:59Z'))).toBe('99');
    expect(getX509Year(new Date('2000-01-01T00:00:00Z'))).toBe('00');
    expect(getX509Year(new Date('2001-12-31T23:59:59Z'))).toBe('01');
    expect(getX509Year(new Date('2049-12-31T23:59:59Z'))).toBe('49');
  });

  it('should return 4-digit year for years before 1950', () => {
    expect(getX509Year(new Date('1949-12-31T23:59:59Z'))).toBe('1949');
    expect(getX509Year(new Date('1900-01-01T00:00:00Z'))).toBe('1900');
    expect(getX509Year(new Date('1800-06-15T12:30:45Z'))).toBe('1800');
  });

  it('should return 4-digit year for years after 2049', () => {
    expect(getX509Year(new Date('2050-01-01T00:00:00Z'))).toBe('2050');
    expect(getX509Year(new Date('2100-12-31T23:59:59Z'))).toBe('2100');
    expect(getX509Year(new Date('3000-06-15T12:30:45Z'))).toBe('3000');
  });

  it('should handle edge cases correctly', () => {
    // Test the boundary years
    expect(getX509Year(new Date('1950-01-01T00:00:00Z'))).toBe('50');
    expect(getX509Year(new Date('2049-12-31T23:59:59Z'))).toBe('49');
    expect(getX509Year(new Date('1949-12-31T23:59:59Z'))).toBe('1949');
    expect(getX509Year(new Date('2050-01-01T00:00:00Z'))).toBe('2050');
  });
});

describe('toX509Time', () => {
  it('should format date with 2-digit year for years 1950-2049', () => {
    const date = new Date('2024-03-20T15:30:45Z');
    expect(toX509Time(date)).toBe('240320153045Z');
  });

  it('should format date with 4-digit year for years outside 1950-2049', () => {
    const date1949 = new Date('1949-12-31T23:59:59Z');
    expect(toX509Time(date1949)).toBe('19491231235959Z');

    const date2050 = new Date('2050-01-01T00:00:00Z');
    expect(toX509Time(date2050)).toBe('20500101000000Z');
  });

  it('should handle single digit months and days', () => {
    const date = new Date('2024-01-05T09:07:03Z');
    expect(toX509Time(date)).toBe('240105090703Z');
  });

  it('should handle midnight and noon', () => {
    const midnight = new Date('2024-06-15T00:00:00Z');
    expect(toX509Time(midnight)).toBe('240615000000Z');

    const noon = new Date('2024-06-15T12:00:00Z');
    expect(toX509Time(noon)).toBe('240615120000Z');
  });

  it('should handle end of day', () => {
    const endOfDay = new Date('2024-12-31T23:59:59Z');
    expect(toX509Time(endOfDay)).toBe('241231235959Z');
  });

  it('should always use UTC time', () => {
    // Create a date in local timezone but verify it's converted to UTC
    const date = new Date('2024-03-20T15:30:45Z');
    expect(toX509Time(date)).toBe('240320153045Z');
  });

  it('should handle leap year correctly', () => {
    const leapYear = new Date('2024-02-29T12:00:00Z');
    expect(toX509Time(leapYear)).toBe('240229120000Z');
  });
});
