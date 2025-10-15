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
    it('should return "String" for string primitive', () => {
      expect(getTypeName('hello')).toBe('String');
    });

    it('should return "Number" for number primitive', () => {
      expect(getTypeName(123)).toBe('Number');
    });

    it('should return "Boolean" for boolean primitive', () => {
      expect(getTypeName(true)).toBe('Boolean');
    });

    it('should return "symbol" for symbol primitive', () => {
      expect(getTypeName(Symbol('s'))).toBe('Symbol');
    });

    it('should return "bigint" for bigint primitive', () => {
      expect(getTypeName(1n)).toBe('BigInt');
    });
  });

  describe('built-in objects', () => {
    it('should return "Object" for plain object literal', () => {
      expect(getTypeName({})).toBe('Object');
    });

    it('should return "Array" for arrays', () => {
      expect(getTypeName([1, 2, 3])).toBe('Array');
    });

    it('should return "Date" for Date instances', () => {
      expect(getTypeName(new Date())).toBe('Date');
    });

    it('should return "RegExp" for RegExp instances', () => {
      expect(getTypeName(/a/)).toBe('RegExp');
    });

    it('should return "Map" for Map instances', () => {
      expect(getTypeName(new Map())).toBe('Map');
    });

    it('should return "Set" for Set instances', () => {
      expect(getTypeName(new Set())).toBe('Set');
    });

    it('should return "WeakMap" for WeakMap instances', () => {
      expect(getTypeName(new WeakMap())).toBe('WeakMap');
    });

    it('should return "WeakSet" for WeakSet instances', () => {
      expect(getTypeName(new WeakSet())).toBe('WeakSet');
    });

    it('should return "Error" for Error instances', () => {
      expect(getTypeName(new Error('x'))).toBe('Error');
    });

    it('should return "Promise" for Promise instances', () => {
      expect(getTypeName(Promise.resolve(1))).toBe('Promise');
    });
  });

  describe('functions and classes', () => {
    it('should return "Function" for functions', () => {
      const fn = (): number => 1;
      expect(getTypeName(fn)).toBe('Function');
    });

    it('should return class name for class instances', () => {
      class MyClass {}
      expect(getTypeName(new MyClass())).toBe('MyClass');
    });
  });

  describe('edge cases', () => {
    it('should return "object" for objects without prototype', () => {
      const obj = Object.create(null);
      expect(getTypeName(obj)).toBe('object');
    });
  });
});
