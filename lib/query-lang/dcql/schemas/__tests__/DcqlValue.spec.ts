import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { dcqlValueSchema } from '../DcqlValue';

describe('dcqlValueSchema', () => {
  describe('should accept valid DCQL values', () => {
    it('accepts string values', () => {
      expect(dcqlValueSchema.parse('hello')).toBe('hello');
      expect(dcqlValueSchema.parse('')).toBe('');
      expect(dcqlValueSchema.parse('123')).toBe('123');
    });

    it('accepts number values', () => {
      expect(dcqlValueSchema.parse(0)).toBe(0);
      expect(dcqlValueSchema.parse(42)).toBe(42);
      expect(dcqlValueSchema.parse(-10)).toBe(-10);
      expect(dcqlValueSchema.parse(3.14)).toBe(3.14);
    });

    it('accepts boolean values', () => {
      expect(dcqlValueSchema.parse(true)).toBe(true);
      expect(dcqlValueSchema.parse(false)).toBe(false);
    });

    it('accepts null', () => {
      expect(dcqlValueSchema.parse(null)).toBeNull();
    });
  });

  describe('should reject invalid values', () => {
    it('rejects undefined', () => {
      expect(() => dcqlValueSchema.parse(undefined)).toThrow();
    });

    it('rejects arrays', () => {
      expect(() => dcqlValueSchema.parse([])).toThrow();
      expect(() => dcqlValueSchema.parse([1, 2, 3])).toThrow();
    });

    it('rejects objects', () => {
      expect(() => dcqlValueSchema.parse({})).toThrow();
      expect(() => dcqlValueSchema.parse({ key: 'value' })).toThrow();
    });

    it('rejects Date objects', () => {
      expect(() => dcqlValueSchema.parse(new Date())).toThrow();
    });

    it('rejects Symbol', () => {
      expect(() => dcqlValueSchema.parse(Symbol('test'))).toThrow();
    });
  });

  describe('safeParse', () => {
    it('returns success for valid values', () => {
      expect(dcqlValueSchema.safeParse('test').success).toBe(true);
      expect(dcqlValueSchema.safeParse(123).success).toBe(true);
      expect(dcqlValueSchema.safeParse(true).success).toBe(true);
      expect(dcqlValueSchema.safeParse(null).success).toBe(true);
    });

    it('returns error for invalid values', () => {
      expect(dcqlValueSchema.safeParse([]).success).toBe(false);
      expect(dcqlValueSchema.safeParse({}).success).toBe(false);
      expect(dcqlValueSchema.safeParse(undefined).success).toBe(false);
    });

    it('returns ZodError for invalid values', () => {
      const result = dcqlValueSchema.safeParse([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });
  });
});
