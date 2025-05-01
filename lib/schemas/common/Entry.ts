/**
 * Type utility for creating key-value pair entries from a record type
 * @description
 * A generic type that converts a Record type into a tuple of [key, value].
 * This is useful for working with object entries in a type-safe manner.
 *
 * @template T - The record type to convert into entries
 * @returns A tuple type [K, V] where K is the key type and V is the value type
 *
 * @example
 * ```typescript
 * type MyRecord = { name: string; age: number };
 * type MyEntry = Entry<MyRecord>; // [string, string | number]
 * ```
 */
export type Entry<T> = T extends Record<infer K, infer V> ? [K, V] : never;
