import { describe, expect, it } from 'vitest';
import { numberKey, numberMap } from '../NumberMap';

describe('NumberMap', () => {
  describe('numberKey', () => {
    it('should accept positive integers', () => {
      expect(numberKey.parse(1)).toBe(1);
      expect(numberKey.parse(123)).toBe(123);
      expect(numberKey.parse(999999)).toBe(999999);
    });

    it('should accept numeric strings and transform to numbers', () => {
      expect(numberKey.parse('1')).toBe(1);
      expect(numberKey.parse('123')).toBe(123);
      expect(numberKey.parse('999999')).toBe(999999);
    });

    it('should reject negative numbers', () => {
      expect(() => numberKey.parse(-1)).toThrow();
      expect(() => numberKey.parse(-123)).toThrow();
    });

    it('should reject zero', () => {
      expect(() => numberKey.parse(0)).toThrow();
      expect(() => numberKey.parse('0')).toThrow();
    });

    it('should reject non-numeric strings', () => {
      expect(() => numberKey.parse('abc')).toThrow();
      expect(() => numberKey.parse('123abc')).toThrow();
      expect(() => numberKey.parse('')).toThrow();
    });

    it('should reject non-integer numbers', () => {
      expect(() => numberKey.parse(1.5)).toThrow();
      expect(() => numberKey.parse(1.0)).not.toThrow(); // 1.0 is valid
    });

    it('should reject other types', () => {
      expect(() => numberKey.parse(true)).toThrow();
      expect(() => numberKey.parse(null)).toThrow();
      expect(() => numberKey.parse(undefined)).toThrow();
      expect(() => numberKey.parse({})).toThrow();
      expect(() => numberKey.parse([])).toThrow();
    });
  });

  describe('numberMap', () => {
    it('should accept object with numeric keys and transform to Map', () => {
      const input = {
        '1': 'value1',
        '2': 'value2',
        '3': 'value3',
      };
      const result = numberMap.parse(input);

      expect(result).toBeInstanceOf(Map);
      expect(result.get(1)).toBe('value1');
      expect(result.get(2)).toBe('value2');
      expect(result.get(3)).toBe('value3');
    });

    it('should accept object with mixed string/number keys', () => {
      const input = {
        '1': 'value1',
        2: 'value2',
        '3': 'value3',
      };
      const result = numberMap.parse(input);

      expect(result).toBeInstanceOf(Map);
      expect(result.get(1)).toBe('value1');
      expect(result.get(2)).toBe('value2');
      expect(result.get(3)).toBe('value3');
    });

    it('should accept existing Map', () => {
      const input = new Map([
        [1, 'value1'],
        [2, 'value2'],
        [3, 'value3'],
      ]);
      const result = numberMap.parse(input);

      expect(result).toBeInstanceOf(Map);
      expect(result.get(1)).toBe('value1');
      expect(result.get(2)).toBe('value2');
      expect(result.get(3)).toBe('value3');
    });

    it('should handle empty object', () => {
      const input = {};
      const result = numberMap.parse(input);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should handle empty Map', () => {
      const input = new Map();
      const result = numberMap.parse(input);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should reject object with invalid keys', () => {
      expect(() => numberMap.parse({ abc: 'value' })).toThrow();
      expect(() => numberMap.parse({ '-1': 'value' })).toThrow();
      expect(() => numberMap.parse({ '0': 'value' })).toThrow();
      expect(() => numberMap.parse({ '1.5': 'value' })).toThrow();
    });

    it('should reject non-object/non-Map inputs', () => {
      expect(() => numberMap.parse('string')).toThrow();
      expect(() => numberMap.parse(123)).toThrow();
      expect(() => numberMap.parse(true)).toThrow();
      expect(() => numberMap.parse(null)).toThrow();
      expect(() => numberMap.parse(undefined)).toThrow();
      expect(() => numberMap.parse([])).toThrow();
    });
  });
});
