/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Type definition for a key-value map
 * @description
 * Represents a mapping of keys to their corresponding values as tuples.
 * Each key-value pair is represented as a tuple [K, T[K]].
 * For Record<string, any> types, returns [string, T[string]] to allow dynamic key-value pairs.
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
 *
 * type DynamicMap = KVMap<Record<string, string>>;
 * // Result: [string, string] (allows dynamic string keys with string values)
 * ```
 */
export type KVMap<T> = {
  [K in keyof T]: K extends string ? [K, T[K]] : never;
}[keyof T];
