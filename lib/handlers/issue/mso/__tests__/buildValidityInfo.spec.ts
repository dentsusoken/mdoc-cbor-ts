import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { buildValidityInfo } from '../buildValidityInfo';

describe('buildValidityInfo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const base = new Date('2025-01-01T00:00:00Z');
    vi.setSystemTime(base);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should build validity info with all required fields', () => {
    const result = buildValidityInfo({
      validFrom: 0,
      validUntil: 24 * 60 * 60 * 1000, // +1 day
    });

    expect(result).toBeInstanceOf(Object);
    expect(result.signed).toBe('2025-01-01T00:00:00Z');
    expect(result.validFrom).toBe('2025-01-01T00:00:00Z');
    expect(result.validUntil).toBe('2025-01-02T00:00:00Z');
    expect(result.expectedUpdate).toBeUndefined();
  });

  it('should build validity info with expectedUpdate when provided', () => {
    const result = buildValidityInfo({
      validFrom: 0,
      validUntil: 24 * 60 * 60 * 1000, // +1 day
      expectedUpdate: 60 * 60 * 1000, // +1 hour
    });

    expect(result).toBeInstanceOf(Object);
    expect(result.signed).toBe('2025-01-01T00:00:00Z');
    expect(result.validFrom).toBe('2025-01-01T00:00:00Z');
    expect(result.validUntil).toBe('2025-01-02T00:00:00Z');
    expect(result.expectedUpdate).toBe('2025-01-01T01:00:00Z');
  });

  it('should handle future validFrom dates', () => {
    const result = buildValidityInfo({
      validFrom: 2 * 60 * 60 * 1000, // +2 hours
      validUntil: 24 * 60 * 60 * 1000, // +1 day
    });

    expect(result.signed).toBe('2025-01-01T00:00:00Z');
    expect(result.validFrom).toBe('2025-01-01T02:00:00Z');
    expect(result.validUntil).toBe('2025-01-02T00:00:00Z');
  });

  it('should handle zero durations correctly', () => {
    const result = buildValidityInfo({
      validFrom: 0,
      validUntil: 0,
      expectedUpdate: 0,
    });

    expect(result.signed).toBe('2025-01-01T00:00:00Z');
    expect(result.validFrom).toBe('2025-01-01T00:00:00Z');
    expect(result.validUntil).toBe('2025-01-01T00:00:00Z');
    expect(result.expectedUpdate).toBe('2025-01-01T00:00:00Z');
  });
});
