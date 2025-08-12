/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TypedMap } from '@jfromaniello/typedmap';

/**
 * Converts an object type to a TypedMap type recursively
 * @description
 * Transforms an object type into a TypedMap type that can be used with TypedMap constructor.
 * Each property becomes a tuple [key, value] in the union type.
 * Only applies KVMap when T is an object type, and recursively converts nested object types.
 *
 * @template T - The object type to convert
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 *   address: { city: string; country: string };
 * }
 *
 * type UserTypedMap = KVObjectToTypeMap<User>;
 * // Result: ["name", string] | ["age", number] | ["address", TypedMap<["city", string] | ["country", string]>]
 *
 * const userMap = new TypedMap<KVObjectToTypeMap<User>>([
 *   ['name', 'John'],
 *   ['age', 30],
 *   ['address', new TypedMap([['city', 'Tokyo'], ['country', 'Japan']])]
 * ]);
 * ```
 */
export type KVObjectToTypedMap<T> = {
  [K in keyof T]: [
    K,
    T[K] extends any[]
      ? T[K]
      : T[K] extends Record<PropertyKey, any>
        ? TypedMap<KVObjectToTypedMap<T[K]>>
        : T[K],
  ];
}[keyof T];
