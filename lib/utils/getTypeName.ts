/**
 * Returns a human-readable type name for the given value.
 *
 * @param value - The value to inspect.
 * @returns The type name as a string (e.g., "string", "number", "Array", "Map", "null", "undefined", etc.).
 */
export const getTypeName = (value: unknown): string => {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return 'undefined';
  }

  return value?.constructor?.name || typeof value;
};
