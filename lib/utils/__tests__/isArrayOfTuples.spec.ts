import { describe, it, expect } from 'vitest';
import { isArrayOfTuples } from '@/utils/isArrayOfTuples';

describe('isArrayOfTuples', () => {
  it('should return true for an array of [PropertyKey, any] tuples', () => {
    expect(
      isArrayOfTuples([
        ['name', 'Alice'],
        [1, true],
      ])
    ).toBe(true);
    expect(
      isArrayOfTuples([
        [Symbol('k'), 123],
        ['age', 42],
      ])
    ).toBe(true);
  });

  it('should return true when tuple values are nested arrays (entries-like)', () => {
    const nested = [
      [
        'ages',
        [
          ['Alice', 20],
          ['Bob', 25],
        ],
      ],
      ['scores', [['math', 90]]],
    ];
    expect(isArrayOfTuples(nested)).toBe(true);
  });

  it('should return false for non-array values', () => {
    expect(isArrayOfTuples('not array')).toBe(false);
    expect(isArrayOfTuples(123)).toBe(false);
    expect(isArrayOfTuples(null)).toBe(false);
    expect(isArrayOfTuples(undefined)).toBe(false);
  });

  it('should return false when any element is not a 2-length tuple', () => {
    expect(
      isArrayOfTuples([['only-one'] as unknown as [PropertyKey, unknown]])
    ).toBe(false);
    expect(
      isArrayOfTuples([[1, 2, 3] as unknown as [PropertyKey, unknown]])
    ).toBe(false);
  });

  it('should return false when a tuple first element is not a PropertyKey', () => {
    expect(
      isArrayOfTuples([[{}, 'v'] as unknown as [PropertyKey, unknown]])
    ).toBe(false);
    expect(
      isArrayOfTuples([[[], 'v'] as unknown as [PropertyKey, unknown]])
    ).toBe(false);
  });
});
