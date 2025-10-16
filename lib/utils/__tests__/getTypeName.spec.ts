import { describe, expect, it } from 'vitest';
import { getTypeName } from '../getTypeName';

describe('getTypeName', () => {
  describe('null and undefined', () => {
    it('should return "null" for null', () => {
      expect(getTypeName(null)).toBe('null');
    });

    it('should return "undefined" for undefined', () => {
      expect(getTypeName(undefined)).toBe('undefined');
    });
  });

  describe('primitives', () => {
    it('should return "string" for string primitive', () => {
      expect(getTypeName('hello')).toBe('string');
    });

    it('should return "number" for number primitive', () => {
      expect(getTypeName(123)).toBe('number');
    });

    it('should return "boolean" for boolean primitive', () => {
      expect(getTypeName(true)).toBe('boolean');
    });

    it('should return "symbol" for symbol primitive', () => {
      expect(getTypeName(Symbol('s'))).toBe('symbol');
    });

    it('should return "bigint" for bigint primitive', () => {
      expect(getTypeName(1n)).toBe('bigint');
    });
  });

  describe('built-in objects', () => {
    it('should return "object" for plain object literal', () => {
      expect(getTypeName({})).toBe('object');
    });

    it('should return "array" for arrays', () => {
      expect(getTypeName([1, 2, 3])).toBe('array');
    });

    it('should return "date" for Date instances', () => {
      expect(getTypeName(new Date())).toBe('date');
    });

    it('should return "object" for RegExp instances', () => {
      expect(getTypeName(/a/)).toBe('object');
    });

    it('should return "map" for Map instances', () => {
      expect(getTypeName(new Map())).toBe('map');
    });

    it('should return "set" for Set instances', () => {
      expect(getTypeName(new Set())).toBe('set');
    });

    it('should return "object" for WeakMap instances', () => {
      expect(getTypeName(new WeakMap())).toBe('object');
    });

    it('should return "object" for WeakSet instances', () => {
      expect(getTypeName(new WeakSet())).toBe('object');
    });

    it('should return "object" for Error instances', () => {
      expect(getTypeName(new Error('x'))).toBe('object');
    });

    it('should return "object" for Promise instances', () => {
      expect(getTypeName(Promise.resolve(1))).toBe('object');
    });
  });

  describe('functions and classes', () => {
    it('should return "function" for functions', () => {
      const fn = (): number => 1;
      expect(getTypeName(fn)).toBe('function');
    });

    it('should return "object" for class instances', () => {
      class MyClass {}
      expect(getTypeName(new MyClass())).toBe('object');
    });
  });

  describe('edge cases', () => {
    it('should return "object" for objects without prototype', () => {
      const obj = Object.create(null);
      expect(getTypeName(obj)).toBe('object');
    });
  });
});
