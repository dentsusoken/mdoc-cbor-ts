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
});
