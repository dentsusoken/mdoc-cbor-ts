import { TypedMap } from '@jfromaniello/typedmap';
import type { KVArray } from '@/types';
import { isPlainObject } from './isPlainObject';
import { isArrayOfTuples } from './isArrayOfTuples';

/**
 * Builds a TypedMap from an array of entry tuples.
 * @description
 * Accepts only entry arrays where each element is a tuple `[PropertyKey, unknown]`.
 * - If a tuple value is itself an array of entry tuples, it is recursively converted
 *   into a nested `TypedMap`.
 * - Plain objects as values are not supported and will cause a `TypeError`.
 *
 * This function does not accept plain objects as input; prefer converting objects
 * to entries with `Object.entries` first if needed.
 *
 * @typeParam E - A readonly array of entry tuples
 * @param input - The entry tuples to convert
 * @returns A `TypedMap` with the same entry shape, with nested entry arrays
 *          recursively converted to `TypedMap` as well
 * @throws {TypeError} When input is not an array of tuples, or when a tuple value
 *                     is a plain object
 *
 * @example
 * ```ts
 * const entries = [
 *   ['name', 'Alice'],
 *   [1, true],
 * ] as const;
 * const tm = typedMap(entries);
 * tm.get('name'); // 'Alice'
 * tm.get(1);      // true
 * ```
 *
 * @example
 * ```ts
 * const nested = [
 *   ['ages', [
 *     ['Alice', 20],
 *     ['Bob', 25],
 *   ]],
 * ] as const;
 * const tm = typedMap(nested);
 * const ages = tm.get('ages'); // TypedMap
 * ages?.get('Alice'); // 20
 * ```
 */
export const typedMap = <E extends readonly unknown[]>(
  input: E
): TypedMap<KVArray<E>> => {
  if (!isArrayOfTuples(input)) {
    throw new TypeError('typedMap: input must be an array of tuples');
  }
  const normalizedEntries = input.map(normalizeEntry);

  return new TypedMap(normalizedEntries) as unknown as TypedMap<KVArray<E>>;
};

/**
 * Normalizes a single entry.
 * - Recursively converts nested entry arrays to `TypedMap`
 * - Throws for plain-object values
 */
const normalizeEntry = (
  entry: readonly [PropertyKey, unknown]
): [PropertyKey, unknown] => {
  const [key, value] = entry;
  if (isArrayOfTuples(value)) {
    return [key, typedMap(value)];
  }
  if (isPlainObject(value)) {
    throw new TypeError(
      `typedMap: plain objects are not supported at key "${String(key)}"`
    );
  }
  return [key, value];
};
