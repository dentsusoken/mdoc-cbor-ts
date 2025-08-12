import { describe, expect, it, expectTypeOf } from 'vitest';
import { KV } from '@/utils/KV';
import { typedMapFromObject } from '@/utils/typedMap';
import { TypedMap } from '@jfromaniello/typedmap';
import type { KVObjectToTypedMap } from '@/types';

describe('KV', () => {
  it('should construct an empty KV by default', () => {
    const kv = new KV();
    expect(kv).toBeInstanceOf(Map);
    expect(kv.size).toBe(0);
  });

  it('should construct from an iterable of entries', () => {
    const entries: Array<readonly [string, number]> = [
      ['a', 1],
      ['b', 2],
    ];
    const kv = new KV(entries);
    expect(kv.size).toBe(2);
    expect(kv.get('a')).toBe(1);
    expect(kv.get('b')).toBe(2);
  });

  it('should construct from another Map iterator', () => {
    const base = new Map<string, boolean>([
      ['x', true],
      ['y', false],
    ]);
    const kv = new KV(base);
    expect(kv.size).toBe(2);
    expect(kv.get('x')).toBe(true);
    expect(kv.get('y')).toBe(false);
  });

  it('fromObject should create a KV from a plain object', () => {
    const obj = { foo: 'bar', count: 3 } as Record<string, unknown>;
    const kv = KV.fromObject(obj);
    expect(kv).toBeInstanceOf(KV);
    expect(kv.get('foo')).toBe('bar');
    expect(kv.get('count')).toBe(3);
  });

  it('fromObject with nestedLevel: 0 should preserve value type (compile-time)', () => {
    const obj = { a: 1, b: 'x' } as const;
    const kv = KV.fromObject(obj as Record<string, number | string>, {
      nestedLevel: 0,
    });
    expectTypeOf(kv).toEqualTypeOf<KV<number | string>>();
  });

  it('fromObject with nestedLevel: 1 should wrap nested objects into KV and preserve arrays (runtime)', () => {
    const obj: Record<string, { b: number } | number[]> = {
      a: { b: 1 },
      arr: [1, 2],
    };
    const kv = KV.fromObject(obj, { nestedLevel: 1 });

    const aVal = kv.get('a');
    const arrVal = kv.get('arr');

    expect(aVal).toBeInstanceOf(KV);
    expect(arrVal).toEqual([1, 2]);

    const aKv = aVal as KV<unknown>;
    expect(aKv.get('b')).toBe(1);

    // compile-time assertion
    expectTypeOf(kv).toEqualTypeOf<KV<KV<number> | number[]>>();
  });

  it('fromObject with nestedLevel: 2 should produce nested KV structure (runtime)', () => {
    type L2 = { y: { z: number } };
    const obj: Record<string, L2> = { x: { y: { z: 42 } } };
    const kv = KV.fromObject(obj, { nestedLevel: 2 });

    const l1 = kv.get('x');
    expect(l1).toBeInstanceOf(KV);
    const l1kv = l1 as KV<unknown>;
    const l2 = l1kv.get('y');
    expect(l2).toBeInstanceOf(KV);
    const l2kv = l2 as KV<unknown>;
    expect(l2kv.get('z')).toBe(42);
  });

  it('fromObject should keep arrays of objects as arrays (not KV)', () => {
    const obj: Record<string, Array<{ a: number }>> = {
      arr: [{ a: 1 }, { a: 2 }],
    };
    const kv = KV.fromObject(obj, { nestedLevel: 3 });
    expect(kv.get('arr')).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it('should convert nested object with arrays into KV with nested KV values', () => {
    const obj = {
      aaa: 1,
      bbb: true,
      ccc: [1, 2, 3],
      ddd: {
        ddd1: 1,
        ddd2: false,
      },
    };

    const kv = KV.fromObject(obj);
    const aaa = kv.get('aaa');
    const bbb = kv.get('bbb');
    const ccc = kv.get('ccc');
    const ddd = kv.get('ddd');

    expect(kv.get('aaa')).toBe(1);
    expect(kv.get('bbb')).toBe(true);
    expect(kv.get('ccc')).toEqual([1, 2, 3]);

    const dddVal = kv.get('ddd');
    expect(dddVal).toBeInstanceOf(KV);
    const dddKv = dddVal as KV<unknown>;
    expect(dddKv.get('ddd1')).toBe(1);
    expect(dddKv.get('ddd2')).toBe(false);

    // compile-time check: When using TypedMap with KVObjectToTypedMap, keys are precisely typed
    type Example = typeof obj;
    const tm: TypedMap<KVObjectToTypedMap<Example>> = typedMapFromObject(obj);
    expectTypeOf(tm.get('aaa')).toEqualTypeOf<number>();
    expectTypeOf(tm.get('bbb')).toEqualTypeOf<boolean>();
    expectTypeOf(tm.get('ccc')).toEqualTypeOf<number[]>();
    expectTypeOf(tm.get('ddd')).toEqualTypeOf<
      TypedMap<KVObjectToTypedMap<Example['ddd']>>
    >();
  });

  it('toObject should convert KV back to a plain object', () => {
    const kv = new KV<unknown>([
      ['alpha', 1],
      ['beta', 'two'],
    ]);
    const obj = kv.toObject();
    expect(obj).toEqual({ alpha: 1, beta: 'two' });
  });

  it('should work without explicit generics (default unknown) - strings', () => {
    const kv = new KV([
      ['k1', 'v1'],
      ['k2', 'v2'],
    ]);
    expect(kv.get('k1')).toBe('v1');
    expect(kv.get('k2')).toBe('v2');
    kv.set('k3', 'v3');
    expect(kv.get('k3')).toBe('v3');
  });

  it('should work without explicit generics (default unknown) - numbers', () => {
    const kv = new KV([
      ['n1', 1],
      ['n2', 2],
    ]);
    expect(kv.get('n1')).toBe(1);
    expect(kv.get('n2')).toBe(2);
    kv.set('n3', 3);
    expect(kv.get('n3')).toBe(3);
  });
});
