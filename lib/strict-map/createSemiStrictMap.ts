import type { SemiEntryTuples, SemiStrictMap, StrictMapEntries } from './types';

/**
 * Creates a semi-strict Map with type-safe known keys and flexible unknown keys
 * @description
 * This function creates a standard JavaScript Map with:
 * - Known keys (T): Fully type-safe get/set operations with specific value types
 * - Unknown keys (U): Key is type-checked but value accepts any type (unknown)
 * - Compatible with cbor-x for CBOR serialization (pure Map instance)
 * - Accepts optional initial entries with type-checked keys and values
 *
 * This is particularly useful for structures like COSE headers where:
 * - Some headers have well-defined types (e.g., algorithm: number)
 * - Other headers are allowed but their types vary or are not strictly defined
 *
 * @template T - The entries array type (must be `as const`)
 * @template U - The type constraint for additional allowed keys (default: string | number)
 * @param entries - Optional initial entries as an iterable of [key, value] tuples
 *
 * @example
 * ```typescript
 * // Define COSE header labels
 * enum Headers {
 *   Algorithm = 1,
 *   KeyId = 4,
 *   ContentType = 3,
 *   IV = 5,
 * }
 *
 * // Define known headers with specific types
 * const entries = [
 *   [Headers.Algorithm, z.number()],
 *   [Headers.KeyId, z.string()],
 * ] as const;
 *
 * // Create empty map
 * const map1 = createSemiStrictMap<typeof entries, Headers>();
 *
 * // Create with initial values
 * const map2 = createSemiStrictMap<typeof entries, Headers>([
 *   [Headers.Algorithm, -7],
 *   [Headers.KeyId, 'key-123'],
 *   [Headers.ContentType, 'application/cbor'],
 * ]);
 *
 * // Known keys - fully type-safe
 * map1.set(Headers.Algorithm, -7);     // ✓ number required
 * map1.set(Headers.KeyId, 'key-123');  // ✓ string required
 * // map1.set(Headers.Algorithm, 'ES256'); // ✗ Type error: must be number
 *
 * // Unknown keys - key is checked, value is flexible
 * map1.set(Headers.ContentType, 'application/cbor'); // ✓ any value accepted
 * map1.set(Headers.IV, new Uint8Array([1, 2, 3]));  // ✓ any value accepted
 *
 * // Get operations
 * const alg = map2.get(Headers.Algorithm);     // number | undefined
 * const kid = map2.get(Headers.KeyId);         // string | undefined
 * const ct = map2.get(Headers.ContentType);    // unknown
 * const iv = map2.get(Headers.IV);             // unknown
 * ```
 *
 * @example
 * ```typescript
 * // With string keys and mixed known/unknown
 * const entries = [
 *   ['name', z.string()],
 *   ['age', z.number()],
 * ] as const;
 *
 * type AllowedKeys = 'name' | 'age' | 'email' | 'phone';
 *
 * // Create with initial values
 * const map = createSemiStrictMap<typeof entries, AllowedKeys>([
 *   ['name', 'Alice'],
 *   ['age', 25],
 *   ['email', 'alice@example.com'],
 * ]);
 *
 * map.set('name', 'Alice');  // ✓ string required
 * map.set('age', 25);        // ✓ number required
 * map.set('email', 'alice@example.com'); // ✓ any value (unknown key)
 * map.set('phone', '+1234567890');       // ✓ any value (unknown key)
 * // map.set('address', '...'); // ✗ Type error: 'address' not in AllowedKeys
 * ```
 *
 * @example
 * ```typescript
 * // Compatible with cbor-x (using encodeCbor/decodeCbor)
 * import { encodeCbor, decodeCbor } from '../../../cbor/codec';
 *
 * const map = createSemiStrictMap<typeof entries, Headers>([
 *   [Headers.Algorithm, -7],
 *   [Headers.ContentType, 'application/cbor'],
 * ]);
 *
 * const encoded = encodeCbor(map); // Works! Map is serialized as CBOR map
 * const decoded = decodeCbor(encoded); // Decoded as Map
 * ```
 */
export const createSemiStrictMap = <
  T extends StrictMapEntries,
  U extends string | number = string | number,
>(
  entries?: Iterable<SemiEntryTuples<T, U>>
): SemiStrictMap<T, U> => new Map(entries) as SemiStrictMap<T, U>;
