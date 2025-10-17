import { describe, it, expectTypeOf } from 'vitest';
import type { EnumKeys, EnumNumberValues, EnumStringValues } from '../index';

describe('types/index', () => {
  enum ExNum {
    A = 1,
    B = 2,
  }

  enum ExStr {
    X = 'x',
    Y = 'y',
  }

  it('EnumKeys extracts union of keys', () => {
    type K1 = EnumKeys<typeof ExNum>;
    expectTypeOf<K1>().toEqualTypeOf<'A' | 'B'>();

    type K2 = EnumKeys<typeof ExStr>;
    expectTypeOf<K2>().toEqualTypeOf<'X' | 'Y'>();
  });

  it('EnumNumberValues extracts union of numeric values', () => {
    type V1 = EnumNumberValues<typeof ExNum>;
    expectTypeOf<V1>().toEqualTypeOf<1 | 2>();
  });

  it('EnumStringValues extracts union of string values', () => {
    type V2 = EnumStringValues<typeof ExStr>;
    expectTypeOf<V2>().toEqualTypeOf<'x' | 'y'>();
  });
});
