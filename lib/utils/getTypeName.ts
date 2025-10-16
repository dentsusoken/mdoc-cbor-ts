/**
 * Returns a lowercase, human-readable type name for the provided value.
 *
 * This function distinguishes between `null`, `undefined`, primitive types,
 * and common built-in object types (such as "array" or "map") using the constructor name when possible.
 *
 * @param value - The value whose type is to be determined.
 * @returns The type name as a lowercase string (e.g., "string", "number", "array", "map", "null", "undefined", etc.).
 */
export const getTypeName = (value: unknown): string => {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return 'undefined';
  }

  const type = typeof value;

  if (type !== 'object') {
    return type;
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (value instanceof Date) {
    return 'date';
  }

  if (value instanceof Map) {
    return 'map';
  }
  if (value instanceof Set) {
    return 'set';
  }

  return 'object';
};
