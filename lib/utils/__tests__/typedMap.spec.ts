import { describe, it, expect } from 'vitest';
import { TypedMap } from '@jfromaniello/typedmap';
import { typedMap } from '@/utils/typedMap';

describe('typedMap', () => {
  it('should build a TypedMap preserving arrays and nesting', () => {
    const arr = [
      ['aaa', 1],
      [2, true],
      ['ccc', [1, 2, 3]],
      [
        'ddd',
        [
          ['ddd1', 10],
          ['ddd2', false],
        ],
      ],
    ] as const;

    const tm = typedMap(arr);

    // runtime checks
    expect(tm).toBeInstanceOf(TypedMap);
    expect(tm.get('aaa')).toBe(1);
    expect(tm.get(2)).toBe(true);
    expect(tm.get('ccc')).toEqual([1, 2, 3]);
    const ddd = tm.get('ddd');
    expect(ddd).toBeInstanceOf(TypedMap);
    expect(ddd?.get('ddd1')).toBe(10);
    expect(ddd?.get('ddd2')).toBe(false);
  });

  it('should handle deeper nesting', () => {
    const entries = [['a', [['b', [['c', 99]]]]]] as const;
    const tm = typedMap(entries);
    const a = tm.get('a');
    if (!a) {
      throw new Error('a is undefined');
    }
    const b = a.get('b');
    if (!b) {
      throw new Error('b is undefined');
    }
    const c = b.get('c');
    expect(c).toBe(99);
  });
});
