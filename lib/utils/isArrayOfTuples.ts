import { isTuple } from './isTuple';

/**
 * Determines if the provided value is an array of entry tuples.
 *
 * An entry tuple is defined as an array of length 2 where the first element
 * is a valid PropertyKey (string | number | symbol) and the second element
 * is any value. This function checks if the given value is an array where
 * every element is such a tuple.
 *
 * @param value - The value to check.
 * @returns True if the value is an array of tuples of shape [PropertyKey, unknown]; otherwise false.
 *
 * @example
 * ```ts
 * isArrayOfTuples([['name', 'Alice'], [1, true]]); // true
 * isArrayOfTuples([['key', 'value'], ['anotherKey', 42]]); // true
 * isArrayOfTuples(['not-a-tuple']); // false
 * isArrayOfTuples([{ key: 'value' }]); // false
 * ```
 */
export const isArrayOfTuples = (
  value: unknown
): value is Array<[PropertyKey, unknown]> => {
  return Array.isArray(value) && value.every(isTuple);
};
