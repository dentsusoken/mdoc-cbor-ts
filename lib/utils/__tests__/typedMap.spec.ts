import { describe, it, expect, expectTypeOf } from 'vitest';
import { TypedMap } from '@jfromaniello/typedmap';
import { typedMap, typedMapFromObject } from '@/utils/typedMap';
import type { KVObjectToTypedMap } from '@/types';

describe('typedMap', () => {
  it('should build a TypedMap preserving arrays and nesting', () => {
    const obj = {
      aaa: 1,
      bbb: true,
      ccc: [1, 2, 3],
      ddd: { ddd1: 10, ddd2: false },
    };

    const tm = typedMap(obj);

    // runtime checks
    expect(tm).toBeInstanceOf(TypedMap);
    expect(tm.get('aaa')).toBe(1);
    expect(tm.get('bbb')).toBe(true);
    expect(tm.get('ccc')).toEqual([1, 2, 3]);
    const ddd = tm.get('ddd');
    expect(ddd).toBeInstanceOf(TypedMap);
    expect(ddd?.get('ddd1')).toBe(10);
    expect(ddd?.get('ddd2')).toBe(false);

    // compile-time checks
    expectTypeOf(tm).toEqualTypeOf<TypedMap<KVObjectToTypedMap<typeof obj>>>();
    expectTypeOf(tm.get('aaa')).toEqualTypeOf<number | undefined>();
    expectTypeOf(tm.get('bbb')).toEqualTypeOf<boolean | undefined>();
    expectTypeOf(tm.get('ccc')).toEqualTypeOf<number[] | undefined>();
    expectTypeOf(tm.get('ddd')).toEqualTypeOf<
      TypedMap<KVObjectToTypedMap<(typeof obj)['ddd']>> | undefined
    >();
    expectTypeOf(ddd?.get('ddd1')).toEqualTypeOf<number | undefined>();
    expectTypeOf(ddd?.get('ddd2')).toEqualTypeOf<boolean | undefined>();
  });

  it('should handle deeper nesting', () => {
    const obj = { a: { b: { c: 99 } } } as const;
    const tm = typedMap(obj);
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
