/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TypedMap } from '@jfromaniello/typedmap';

/**
 * Type definition for a key-value map
 * @description
 * Represents a mapping of keys to their corresponding values as tuples.
 * Each key-value pair is represented as a tuple [K, T[K]].
 *
 * @template T - The type of the object whose key-value pairs are being mapped
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 * }
 *
 * type UserKVMap = KVMap<User>;
 * // Result: ["name", string] | ["age", number]
 * ```
 */
export type KVMap<T> =
  T extends Record<string, any>
    ? any
    : {
        [K in keyof T]: [K, T[K]];
      }[keyof T];

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
 * type UserTypedMap = ToTypedMap<User>;
 * // Result: TypedMap<["name", string] | ["age", number] | ["address", TypedMap<["city", string] | ["country", string]>]>
 *
 * const userMap = new TypedMap<UserTypedMap>([
 *   ['name', 'John'],
 *   ['age', 30],
 *   ['address', new TypedMap([['city', 'Tokyo'], ['country', 'Japan']])]
 * ]);
 * ```
 */
export type KVDecodedMap<T> =
  T extends Record<string, any>
    ? any
    : {
        [K in keyof T]: [
          K,
          T[K] extends any[]
            ? T[K]
            : T[K] extends Record<string, any>
              ? TypedMap<KVDecodedMap<T[K]>>
              : T[K],
        ];
      }[keyof T];
