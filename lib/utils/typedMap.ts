import { TypedMap } from '@jfromaniello/typedmap';
import type { KVObjectToTypedMap } from '@/types';

/**
 * Builds a TypedMap from a plain object with precise key/value typing.
 * Arrays are preserved; nested plain objects become nested TypedMap.
 */
export const typedMap = <T>(obj: T): TypedMap<KVObjectToTypedMap<T>> => {
  const entries = Object.entries(obj as Record<string, unknown>).map(
    ([key, value]) => {
      if (isPlainObject(value)) {
        const nested = typedMap(value);
        return [key, nested] as const;
      }
      return [key, value] as const;
    }
  );
  // Typing the constructor input precisely is not feasible without per-key generics.
  // We rely on the TypedMap generic KVObjectToTypedMap<T> to enforce correct get/set types.
  return new TypedMap(entries as unknown as Array<KVObjectToTypedMap<T>>);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * @deprecated Use `typedMap` instead. This alias remains for backward compatibility.
 */
export const typedMapFromObject = typedMap;
