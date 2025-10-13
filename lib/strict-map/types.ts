import { z } from 'zod';

/**
 * Type representing the entries array for StrictMap schemas
 * @description
 * A readonly array of [key, schema] tuples where:
 * - key: string or number literal (the map key)
 * - schema: any Zod schema type
 *
 * Use `as const` when defining entries to preserve literal types
 *
 * @example
 * ```typescript
 * // String keys
 * const entries1 = [
 *   ['name', z.string()],
 *   ['age', z.number()],
 * ] as const satisfies StrictMapEntries;
 *
 * // Number keys (e.g., COSE headers)
 * const entries2 = [
 *   [1, z.number()],  // Algorithm
 *   [4, z.string()],  // Key ID
 * ] as const satisfies StrictMapEntries;
 *
 * // Mixed keys
 * const entries3 = [
 *   [1, z.number()],
 *   ['custom', z.string()],
 * ] as const satisfies StrictMapEntries;
 * ```
 */
export type StrictMapEntries = ReadonlyArray<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly [string | number, z.ZodType<any, any, any>]
>;

/**
 * Extract key type from entries (union of all keys)
 */
export type ExtractKeys<T extends StrictMapEntries> = T[number][0];

/**
 * Extract value type from entries (union of all inferred schema types)
 */
export type ExtractValues<T extends StrictMapEntries> = z.infer<T[number][1]>;

/**
 * Extract value type for a specific key
 */
export type ExtractValueTypeForKey<
  T extends StrictMapEntries,
  K extends ExtractKeys<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = z.infer<Extract<T[number], readonly [K, z.ZodType<any, any, any>]>[1]>;

/**
 * Convert StrictMapEntries to a union of [key, value] tuples
 * This type is used for type-safe initial entries in createStrictMap
 *
 * @example
 * ```typescript
 * const entries = [
 *   ['name', z.string()],
 *   ['age', z.number()],
 * ] as const;
 *
 * type Tuples = EntryTuples<typeof entries>;
 * // Result: readonly ['name', string] | readonly ['age', number]
 * ```
 */
export type EntryTuples<T extends StrictMapEntries> = {
  [K in keyof T]: T[K] extends readonly [infer Key, infer Schema]
    ? Schema extends z.ZodType<infer Value>
      ? readonly [Key, Value]
      : never
    : never;
}[number];

/**
 * Convert StrictMapEntries to a union of [key, value] tuples including unknown keys
 * This type is used for type-safe initial entries in createSemiStrictMap
 *
 * @example
 * ```typescript
 * enum Headers {
 *   Algorithm = 1,
 *   KeyId = 4,
 *   ContentType = 3,
 * }
 *
 * const entries = [
 *   [Headers.Algorithm, z.number()],
 *   [Headers.KeyId, z.string()],
 * ] as const;
 *
 * type Tuples = SemiEntryTuples<typeof entries, Headers>;
 * // Result:
 * //   readonly [1, number] |           // Known key with specific type
 * //   readonly [4, string] |           // Known key with specific type
 * //   readonly [3 | 5, unknown]        // Unknown keys with unknown type
 * ```
 */
export type SemiEntryTuples<
  T extends StrictMapEntries,
  U extends string | number,
> = EntryTuples<T> | readonly [Exclude<U, ExtractKeys<T>>, unknown];

/**
 * Type-safe Map with overloaded get method for known keys
 * @description
 * This type represents a standard JavaScript Map with type-safe get/set/delete operations.
 * The Map instance is compatible with cbor-x for CBOR serialization.
 *
 * @template T - The entries array type
 *
 * @example
 * ```typescript
 * const entries = [
 *   ['name', z.string()],
 *   ['age', z.number()],
 * ] as const;
 *
 * type MyMap = StrictMap<typeof entries>;
 *
 * const map: MyMap = createStrictMap<typeof entries>();
 * map.set('name', 'Alice');  // ✓ Type-safe
 * map.set('age', 25);        // ✓ Type-safe
 *
 * const name = map.get('name'); // string | undefined
 * const age = map.get('age');   // number | undefined
 * ```
 */
export type StrictMap<T extends StrictMapEntries> = Omit<
  Map<ExtractKeys<T>, ExtractValues<T>>,
  | 'get'
  | 'set'
  | 'delete'
  | 'entries'
  | 'keys'
  | 'values'
  | typeof Symbol.iterator
> & {
  /**
   * Get a value for a specific key with type safety
   * @template K - The key literal type
   * @param key - The key to get
   * @returns The value for known keys (specific type | undefined)
   */
  get<K extends ExtractKeys<T>>(
    key: K
  ): K extends ExtractKeys<T>
    ? ExtractValueTypeForKey<T, K> | undefined
    : never;

  /**
   * Set a value for a specific key with type safety
   * @template K - The key literal type
   * @param key - The key to set
   * @param value - The value, typed according to the key's schema
   * @returns This Map instance for method chaining
   */
  set<K extends ExtractKeys<T>>(
    key: K,
    value: K extends ExtractKeys<T> ? ExtractValueTypeForKey<T, K> : never
  ): StrictMap<T>;

  /**
   * Delete a key from the map
   * @param key - The key to delete
   * @returns true if the key existed and was deleted, false otherwise
   */
  delete(key: ExtractKeys<T>): boolean;

  /**
   * Returns an iterable of key, value pairs for every entry in the map
   * @returns An iterable of [key, value] tuples with accurate types
   */
  entries(): IterableIterator<EntryTuples<T>>;

  /**
   * Returns an iterable of keys in the map
   * @returns An iterable of keys
   */
  keys(): IterableIterator<ExtractKeys<T>>;

  /**
   * Returns an iterable of values in the map
   * @returns An iterable of values
   */
  values(): IterableIterator<ExtractValues<T>>;

  /**
   * Returns an iterable iterator for the map entries
   * @returns An iterable iterator of [key, value] tuples
   */
  [Symbol.iterator](): IterableIterator<EntryTuples<T>>;
};

/**
 * Semi-strict Map that combines type-safe known keys with flexible unknown keys
 * @description
 * This type represents a Map where:
 * - Known keys (T): Fully type-safe with specific value types
 * - Unknown keys (U): Key is type-checked but value is `unknown`
 *
 * This is useful when working with structures like COSE headers where:
 * - Some headers have known types (e.g., algorithm = number)
 * - Other headers are allowed but their types are not strictly defined
 *
 * @template T - The entries array type for known keys with specific types
 * @template U - The type constraint for additional allowed keys (default: string | number)
 *
 * @example
 * ```typescript
 * enum Headers {
 *   Algorithm = 1,
 *   KeyId = 4,
 *   ContentType = 3,
 *   IV = 5,
 * }
 *
 * const entries = [
 *   [Headers.Algorithm, z.number()],
 *   [Headers.KeyId, z.string()],
 * ] as const;
 *
 * type MyMap = SemiStrictMap<typeof entries, Headers>;
 *
 * const map: MyMap = createSemiStrictMap<typeof entries, Headers>();
 *
 * // Known keys - fully type-safe
 * map.set(Headers.Algorithm, -7);     // ✓ number required
 * map.set(Headers.KeyId, 'key-123');  // ✓ string required
 *
 * // Unknown keys - key is checked, value is unknown
 * map.set(Headers.ContentType, 'application/cbor'); // ✓ key checked, value is any
 * map.set(Headers.IV, new Uint8Array([1, 2, 3]));  // ✓ key checked, value is any
 *
 * // Get operations
 * const alg = map.get(Headers.Algorithm);     // number | undefined (type-safe)
 * const kid = map.get(Headers.KeyId);         // string | undefined (type-safe)
 * const contentType = map.get(Headers.ContentType); // unknown (not type-safe)
 * ```
 */
export type SemiStrictMap<
  T extends StrictMapEntries,
  U extends string | number = string | number,
> = Omit<
  Map<ExtractKeys<T> | U, ExtractValues<T> | unknown>,
  | 'get'
  | 'set'
  | 'delete'
  | 'entries'
  | 'keys'
  | 'values'
  | typeof Symbol.iterator
> & {
  /**
   * Get a value for a specific key
   * @template K - The key type
   * @param key - The key to get
   * @returns For known keys: specific type | undefined
   *          For unknown keys: unknown
   */
  get<K extends ExtractKeys<T> | U>(
    key: K
  ): K extends ExtractKeys<T>
    ? ExtractValueTypeForKey<T, K> | undefined
    : unknown;

  /**
   * Set a value for a specific key
   * @template K - The key type
   * @param key - The key to set (must be in T or U)
   * @param value - For known keys: specific type required
   *                For unknown keys: any value accepted
   * @returns This Map instance for method chaining
   */
  set<K extends ExtractKeys<T> | U>(
    key: K,
    value: K extends ExtractKeys<T> ? ExtractValueTypeForKey<T, K> : unknown
  ): SemiStrictMap<T, U>;

  /**
   * Delete a key from the map
   * @param key - The key to delete (can be known or unknown key)
   * @returns true if the key existed and was deleted, false otherwise
   */
  delete(key: ExtractKeys<T> | U): boolean;

  /**
   * Returns an iterable of key, value pairs for every entry in the map
   * @returns An iterable of [key, value] tuples with accurate types
   */
  entries(): IterableIterator<SemiEntryTuples<T, U>>;

  /**
   * Returns an iterable of keys in the map
   * @returns An iterable of keys (known and unknown)
   */
  keys(): IterableIterator<ExtractKeys<T> | U>;

  /**
   * Returns an iterable of values in the map
   * @returns An iterable of values
   */
  values(): IterableIterator<ExtractValues<T> | unknown>;

  /**
   * Returns an iterable iterator for the map entries
   * @returns An iterable iterator of [key, value] tuples
   */
  [Symbol.iterator](): IterableIterator<SemiEntryTuples<T, U>>;
};
