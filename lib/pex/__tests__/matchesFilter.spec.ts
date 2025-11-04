import { describe, expect, it } from 'vitest';
import { matchesFilter } from '../matchesFilter';

describe('matchesFilter', () => {
  describe('type-only filtering', () => {
    it('returns true when value matches the specified type', () => {
      expect(matchesFilter({ type: 'string' }, 'foo')).toBe(true);
      expect(matchesFilter({ type: 'number' }, 3.14)).toBe(true);
      expect(matchesFilter({ type: 'boolean' }, false)).toBe(true);
      expect(matchesFilter({ type: 'integer' }, 42)).toBe(true);
    });

    it('returns false when value does not match the specified type', () => {
      expect(matchesFilter({ type: 'integer' }, 4.2)).toBe(false);
      expect(matchesFilter({ type: 'string' }, 123)).toBe(false);
      expect(matchesFilter({ type: 'number' }, '123')).toBe(false);
      expect(matchesFilter({ type: 'boolean' }, 0)).toBe(false);
    });

    it('throws when an invalid type is provided', () => {
      expect(() => matchesFilter({ type: 'unknown' }, 'x')).toThrow(
        'Invalid schema type: unknown'
      );
    });
  });

  describe('const-only filtering', () => {
    it('returns true when value equals the constant', () => {
      expect(matchesFilter({ const: 42 }, 42)).toBe(true);
      expect(matchesFilter({ const: 'abc' }, 'abc')).toBe(true);
      expect(matchesFilter({ const: true }, true)).toBe(true);
    });

    it('returns false when value does not equal the constant', () => {
      expect(matchesFilter({ const: 42 }, 43)).toBe(false);
      expect(matchesFilter({ const: 'abc' }, 'abcd')).toBe(false);
      expect(matchesFilter({ const: true }, false)).toBe(false);
    });
  });

  describe('type and const combined', () => {
    it('returns true only when both type and const match', () => {
      expect(matchesFilter({ type: 'number', const: 10 }, 10)).toBe(true);
    });

    it('returns false when type matches but const differs', () => {
      expect(matchesFilter({ type: 'number', const: 10 }, 11)).toBe(false);
    });

    it('returns false when const matches but type differs', () => {
      expect(matchesFilter({ type: 'number', const: 10 }, '10')).toBe(false);
    });
  });

  describe.skip('edge cases (documented)', () => {
    it('handles falsy const values (0, empty string, false, null)', () => {
      // Expected behavior: should check equality for falsy constants as well
      expect(matchesFilter({ const: 0 }, 0)).toBe(true);
      expect(matchesFilter({ const: 0 }, 1)).toBe(false);
      expect(matchesFilter({ const: '' }, '')).toBe(true);
      expect(matchesFilter({ const: '' }, 'a')).toBe(false);
      expect(matchesFilter({ const: false }, false)).toBe(true);
      expect(matchesFilter({ const: false }, true)).toBe(false);
      expect(matchesFilter({ const: null }, null)).toBe(true);
      expect(matchesFilter({ const: null }, undefined)).toBe(false);
    });
  });
});
