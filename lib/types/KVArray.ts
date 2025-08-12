/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TypedMap } from '@jfromaniello/typedmap';

/**
 * Converts a readonly entry tuple to a mutable form.
 * @description
 * Some generics (like the one used by `TypedMap`) require tuples assignable to
 * `any[]`. This helper preserves the tuple's key/value types while removing
 * the `readonly` constraint.
 *
 * @typeParam T - Tuple type to convert
 */
type MutableTuple<T> = T extends readonly [infer A extends PropertyKey, infer B]
  ? [A, B]
  : T;

/**
 * Recursively transforms an array of entry tuples into a union of tuples,
 * wrapping any nested entry-array values as `TypedMap` recursively.
 *
 * @typeParam E - Readonly array of entry tuples to transform
 *
 * @example
 * ```ts
 * type In = [
 *   ['a', [['b', 1]]],
 *   ['x', string],
 * ];
 * // Out: ['a', TypedMap<['b', 1]>] | ['x', string]
 * type Out = EntriesToTypedMap<In>;
 * ```
 */
type EntriesToTypedMap<E> = E extends readonly (infer Elem)[]
  ? Elem extends readonly [infer K extends PropertyKey, infer V]
    ? MutableTuple<
        [
          K,
          V extends readonly unknown[]
            ? V[number] extends Readonly<[PropertyKey, unknown]>
              ? TypedMap<EntriesToTypedMap<V>>
              : V
            : V,
        ]
      >
    : never
  : never;

/**
 * Type-level transformer for heterogeneous entry arrays.
 * @description
 * Produces a union of entry tuples from a readonly entry array. Handles three
 * patterns:
 * - `[K, V]` tuples are emitted as-is (with nested entry arrays in `V` turned
 *   into `TypedMap` recursively)
 * - A nested array value is traversed recursively
 * - A bare key `K` followed by an entries array `E` becomes `[K, TypedMap<...>]`
 *   where the `...` is the recursive transformation of `E`
 *
 * @typeParam T - Readonly array type to transform
 *
 * @example
 * ```ts
 * type In = [
 *   ['s', string],
 *   ['a', [['b', 1]]],
 * ];
 * // Out: ['s', string] | ['a', TypedMap<['b', 1]>]
 * type Out = KVArray<In>;
 * ```
 */
export type KVArray<T> = T extends readonly []
  ? never
  : T extends readonly [infer Head, ...infer Tail]
    ? Head extends readonly [infer K extends PropertyKey, infer V]
      ?
          | [
              K,
              V extends readonly unknown[]
                ? V[number] extends Readonly<[PropertyKey, unknown]>
                  ? TypedMap<EntriesToTypedMap<V>>
                  : V
                : V,
            ]
          | KVArray<Tail>
      : Head extends readonly unknown[]
        ? KVArray<Head> | KVArray<Tail>
        : Head extends PropertyKey
          ? Tail extends readonly [infer Next, ...infer Rest]
            ? Next extends readonly unknown[]
              ? Next[number] extends Readonly<[PropertyKey, unknown]>
                ? [Head, TypedMap<EntriesToTypedMap<Next>>] | KVArray<Rest>
                : KVArray<Tail>
              : KVArray<Tail>
            : KVArray<Tail>
          : KVArray<Tail>
    : never;
