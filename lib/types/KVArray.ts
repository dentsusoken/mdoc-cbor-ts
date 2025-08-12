/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TypedMap } from '@jfromaniello/typedmap';

type MutableTuple<T> = T extends readonly [infer A extends PropertyKey, infer B]
  ? [A, B]
  : never;

/**
 * Recursively transform an entries array type E into a union of
 * mutable [Key, Value] tuples where nested entry-array values
 * become TypedMap of their recursively transformed entries.
 */
type EntriesToTypedMap<E> = E extends readonly (infer Elem)[]
  ? Elem extends readonly [infer K extends PropertyKey, infer V]
    ? MutableTuple<
        [
          K,
          V extends readonly unknown[]
            ? V[number] extends readonly [PropertyKey, unknown]
              ? TypedMap<EntriesToTypedMap<V>>
              : V
            : V,
        ]
      >
    : never
  : never;

/**
 * Type-level transformer for heterogeneous arrays of entries
 * @description
 * Converts an array type that may contain entry tuples, plain keys, and nested arrays
 * into a union of entry tuples. The transformation is recursive.
 *
 * Rules:
 * - If an element is a tuple [K, V] where K is a PropertyKey, include it in the union
 * - If an element is a nested array, recurse into it and include its results
 * - If an element is a bare key K and the next element is a single-level array of entry tuples,
 *   emit [K, [K2, V2]] using the first-level nested tuple type; then continue with the remaining tail
 *
 * @example
 * ```ts
 * type Input = [
 *   ['aaa', number],
 *   [1, string],
 *   ['bbb', boolean],
 *   2,
 *   [['extra', string], ['extra2', number]]
 * ];
 *
 * type Output = KVArray<Input>;
 * // Result: ['aaa', number] | [1, string] | ['bbb', boolean] | [2, (['extra', string] | ['extra2', number])]
 * ```
 */
// Only accept array types at the top-level. Non-array inputs resolve to never.
export type KVArray<T> = T extends readonly []
  ? never
  : T extends readonly [infer Head, ...infer Tail]
    ? Head extends readonly [infer K extends PropertyKey, infer V]
      ?
          | [
              K,
              V extends readonly unknown[]
                ? V[number] extends readonly [PropertyKey, unknown]
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
              ? Next[number] extends readonly [PropertyKey, unknown]
                ? [Head, TypedMap<EntriesToTypedMap<Next>>] | KVArray<Rest>
                : KVArray<Tail>
              : KVArray<Tail>
            : KVArray<Tail>
          : KVArray<Tail>
    : never;
