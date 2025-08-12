/**
 * Checks whether the given value is an entry tuple in the form [key, value].
 *
 * An entry tuple is defined as an array of length 2 where the first element
 * is a valid PropertyKey (string | number | symbol) and the second element
 * is any value.
 *
 * @param value - The value to check.
 * @returns True if the value is a tuple of shape [PropertyKey, unknown]; otherwise false.
 *
 * @example
 * ```ts
 * isTuple(['name', 'Alice']); // true
 * isTuple(['ages', [['Alice', 20], ['Bob', 25]]]); // true
 * isTuple([1, true]); // true
 * isTuple(Symbol('k')); // false
 * isTuple(['only-one']); // false
 * isTuple({ key: 'value' }); // false
 * ```
 */
export const isTuple = (value: unknown): value is [PropertyKey, unknown] => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    (typeof value[0] === 'string' ||
      typeof value[0] === 'number' ||
      typeof value[0] === 'symbol')
  );
};
