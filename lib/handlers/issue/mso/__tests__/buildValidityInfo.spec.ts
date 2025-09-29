import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Tag } from 'cbor-x';
import { buildValidityInfo } from '../buildValidityInfo';

describe('buildValidityInfo', () => {
  describe('without baseDate', () => {
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
      expect(result.signed).toBeInstanceOf(Tag);
      expect(result.signed.tag).toBe(0);
      expect(result.signed.value).toBe('2025-01-01T00:00:00Z');
      expect(result.validFrom).toBeInstanceOf(Tag);
      expect(result.validFrom.tag).toBe(0);
      expect(result.validFrom.value).toBe('2025-01-01T00:00:00Z');
      expect(result.validUntil).toBeInstanceOf(Tag);
      expect(result.validUntil.tag).toBe(0);
      expect(result.validUntil.value).toBe('2025-01-02T00:00:00Z');
      expect(result.expectedUpdate).toBeUndefined();
    });

    it('should build validity info with expectedUpdate when provided', () => {
      const result = buildValidityInfo({
        validFrom: 0,
        validUntil: 24 * 60 * 60 * 1000, // +1 day
        expectedUpdate: 60 * 60 * 1000, // +1 hour
      });

      expect(result).toBeInstanceOf(Object);
      expect(result.signed).toBeInstanceOf(Tag);
      expect(result.signed.tag).toBe(0);
      expect(result.signed.value).toBe('2025-01-01T00:00:00Z');
      expect(result.validFrom).toBeInstanceOf(Tag);
      expect(result.validFrom.tag).toBe(0);
      expect(result.validFrom.value).toBe('2025-01-01T00:00:00Z');
      expect(result.validUntil).toBeInstanceOf(Tag);
      expect(result.validUntil.tag).toBe(0);
      expect(result.validUntil.value).toBe('2025-01-02T00:00:00Z');
      expect(result.expectedUpdate).toBeInstanceOf(Tag);
      // @ts-expect-error - optional property is present here
      expect(result.expectedUpdate.tag).toBe(0);
      // @ts-expect-error - optional property is present here
      expect(result.expectedUpdate.value).toBe('2025-01-01T01:00:00Z');
    });

    it('should handle future validFrom dates', () => {
      const result = buildValidityInfo({
        validFrom: 2 * 60 * 60 * 1000, // +2 hours
        validUntil: 24 * 60 * 60 * 1000, // +1 day
      });

      expect(result.signed).toBeInstanceOf(Tag);
      expect(result.signed.tag).toBe(0);
      expect(result.signed.value).toBe('2025-01-01T00:00:00Z');
      expect(result.validFrom).toBeInstanceOf(Tag);
      expect(result.validFrom.tag).toBe(0);
      expect(result.validFrom.value).toBe('2025-01-01T02:00:00Z');
      expect(result.validUntil).toBeInstanceOf(Tag);
      expect(result.validUntil.tag).toBe(0);
      expect(result.validUntil.value).toBe('2025-01-02T00:00:00Z');
    });

    it('should handle zero durations correctly', () => {
      const result = buildValidityInfo({
        validFrom: 0,
        validUntil: 0,
        expectedUpdate: 0,
      });

      expect(result.signed).toBeInstanceOf(Tag);
      expect(result.signed.tag).toBe(0);
      expect(result.signed.value).toBe('2025-01-01T00:00:00Z');
      expect(result.validFrom).toBeInstanceOf(Tag);
      expect(result.validFrom.tag).toBe(0);
      expect(result.validFrom.value).toBe('2025-01-01T00:00:00Z');
      expect(result.validUntil).toBeInstanceOf(Tag);
      expect(result.validUntil.tag).toBe(0);
      expect(result.validUntil.value).toBe('2025-01-01T00:00:00Z');
      expect(result.expectedUpdate).toBeInstanceOf(Tag);
      // @ts-expect-error - optional property is present here
      expect(result.expectedUpdate.tag).toBe(0);
      // @ts-expect-error - optional property is present here
      expect(result.expectedUpdate.value).toBe('2025-01-01T00:00:00Z');
    });
  });

  describe('with baseDate', () => {
    it('should use baseDate when provided', () => {
      const baseDate = new Date('2030-06-15T12:34:56Z');
      const result = buildValidityInfo({
        baseDate,
        validFrom: 2 * 60 * 60 * 1000, // +2 hours
        validUntil: 24 * 60 * 60 * 1000, // +1 day
        expectedUpdate: 90 * 60 * 1000, // +1 hour 30 minutes
      });

      expect(result.signed).toBeInstanceOf(Tag);
      expect(result.signed.tag).toBe(0);
      expect(result.signed.value).toBe('2030-06-15T12:34:56Z');
      expect(result.validFrom).toBeInstanceOf(Tag);
      expect(result.validFrom.tag).toBe(0);
      expect(result.validFrom.value).toBe('2030-06-15T14:34:56Z');
      expect(result.validUntil).toBeInstanceOf(Tag);
      expect(result.validUntil.tag).toBe(0);
      expect(result.validUntil.value).toBe('2030-06-16T12:34:56Z');
      expect(result.expectedUpdate).toBeInstanceOf(Tag);
      // @ts-expect-error - optional property is present here
      expect(result.expectedUpdate.tag).toBe(0);
      // @ts-expect-error - optional property is present here
      expect(result.expectedUpdate.value).toBe('2030-06-15T14:04:56Z');
    });
  });
});
