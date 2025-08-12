import { describe, it, expect } from 'vitest';
import { isTuple } from '@/utils/isTuple';

describe('isTuple', () => {
  it('should return true for [string, any]', () => {
    expect(isTuple(['name', 'Alice'])).toBe(true);
    expect(isTuple(['key', 123])).toBe(true);
    expect(isTuple(['flag', false])).toBe(true);
  });

  it('should return true for [number, any]', () => {
    expect(isTuple([1, 'value'])).toBe(true);
    expect(isTuple([0, null])).toBe(true);
  });

  it('should return true for [symbol, any]', () => {
    const k = Symbol('k');
    expect(isTuple([k, { a: 1 }])).toBe(true);
  });

  it('should return false for non-array values', () => {
    expect(isTuple('string')).toBe(false);
    expect(isTuple(42)).toBe(false);
    expect(isTuple(true)).toBe(false);
    expect(isTuple(null)).toBe(false);
    expect(isTuple(undefined)).toBe(false);
    expect(isTuple(Symbol('s'))).toBe(false);
    expect(isTuple(new Map())).toBe(false);
    expect(isTuple(new Set())).toBe(false);
    expect(isTuple({ key: 'value' })).toBe(false);
  });

  it('should return false for arrays with length not equal to 2', () => {
    expect(isTuple([])).toBe(false);
    expect(isTuple(['only-one'])).toBe(false);
    expect(isTuple(['too', 'many', 'values'])).toBe(false);
  });

  it('should return false for arrays where first element is not a PropertyKey', () => {
    expect(isTuple([{}, 'value'])).toBe(false);
    expect(isTuple([[], 1])).toBe(false);
    expect(isTuple([new Date(), 'x'])).toBe(false);
  });

  it('should return true when value is a nested entries array', () => {
    const value = [
      'ages',
      [
        ['Alice', 20],
        ['Bob', 25],
      ],
    ];
    expect(isTuple(value)).toBe(true);
  });
});
