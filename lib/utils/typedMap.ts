import { TypedMap } from '@jfromaniello/typedmap';
import type { KVArray } from '@/types';

export const typedMap = <E extends readonly unknown[]>(
  input: E
): TypedMap<KVArray<E>> => {
  if (!Array.isArray(input)) {
    throw new TypeError('typedMap: input must be an entries array');
  }
  const normalizedEntries = (
    input as Array<readonly [PropertyKey, unknown]>
  ).map(normalizeEntry);

  return new TypedMap(
    normalizedEntries as Iterable<[PropertyKey, unknown]>
  ) as unknown as TypedMap<KVArray<E>>;
};

// Helpers
const isEntryTuple = (value: unknown): value is [PropertyKey, unknown] => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    (typeof value[0] === 'string' ||
      typeof value[0] === 'number' ||
      typeof value[0] === 'symbol')
  );
};

const isEntriesArray = (
  value: unknown
): value is Array<[PropertyKey, unknown]> => {
  return Array.isArray(value) && value.every(isEntryTuple);
};

const isPlainObject = (value: unknown): value is object => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
};

const normalizeEntry = (
  entry: readonly [PropertyKey, unknown]
): [PropertyKey, unknown] => {
  const [key, value] = entry;
  if (isEntriesArray(value)) {
    return [key, typedMap(value)];
  }
  if (isPlainObject(value)) {
    throw new TypeError(
      `typedMap: plain objects are not supported at key "${String(key)}"`
    );
  }
  return [key, value];
};
