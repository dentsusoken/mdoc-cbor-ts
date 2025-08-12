import { describe, it, expectTypeOf } from 'vitest';
import type { KVArray } from '@/types/KVArray';
import type { TypedMap } from '@jfromaniello/typedmap';

describe('KVArray', () => {
  it('should transform heterogeneous arrays recursively into union of tuples', () => {
    type Input = [
      ['aaa', number],
      [1, string],
      ['bbb', boolean],
      2,
      [['extra', string], ['extra2', number]],
    ];

    type Output = KVArray<Input>;
    type Expected =
      | ['aaa', number]
      | [1, string]
      | ['bbb', boolean]
      | [2, TypedMap<['extra', string] | ['extra2', number]>];

    expectTypeOf<Output>().toEqualTypeOf<Expected>();
  });

  it('should resolve to never for non-array (object) inputs', () => {
    type Test = KVArray<{ aaa: string }>;
    expectTypeOf<Test>(null as unknown as Test).toEqualTypeOf<never>();
  });

  it('should handle two-level nested entries under a key', () => {
    type Input = ['a', [['b', [['c', number]]]]];

    type Output = KVArray<Input>;

    // Desired deep-nested mapping (two levels):
    // ['a', TypedMap< ['b', TypedMap< ['c', number ] > ] >]
    type Expected = ['a', TypedMap<['b', TypedMap<['c', number]>]>];

    // This may currently fail if KVArray only wraps one nesting level
    expectTypeOf<Output>().toEqualTypeOf<Expected>();
  });
});
