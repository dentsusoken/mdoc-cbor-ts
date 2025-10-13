import type { EntryTuples, StrictMap, StrictMapEntries } from './types';

/**
 * Creates a type-safe Map with per-key type checking for get/set operations
 * @description
 * This function creates a standard JavaScript Map with type-safe operations:
 * - Type-safe get() method that returns specific types for each key
 * - Type-safe set() method that enforces correct value types for each key
 * - All standard Map operations (has, delete, clear, etc.)
 * - Compatible with cbor-x for CBOR serialization (pure Map instance)
 * - Accepts optional initial entries with type-checked keys and values
 *
 * Each key has its own specific type based on the schema:
 * - `'age'` with `z.number()` → get returns `number | undefined`, set accepts `number`
 * - `'name'` with `z.string()` → get returns `string | undefined`, set accepts `string`
 *
 * @template T - The entries array type (must be `as const`)
 * @param entries - Optional initial entries as an iterable of [key, value] tuples
 *
 * @example
 * ```typescript
 * const entries = [
 *   ['name', z.string()],
 *   ['age', z.number()],
 *   ['active', z.boolean()],
 * ] as const;
 *
 * // Create empty map
 * const map1 = createStrictMap<typeof entries>();
 *
 * // Create with initial values
 * const map2 = createStrictMap<typeof entries>([
 *   ['name', 'Alice'],
 *   ['age', 25],
 *   ['active', true],
 * ]);
 *
 * // Type-safe set operations
 * map1.set('name', 'Alice');  // ✓ string accepted
 * map1.set('age', 25);        // ✓ number accepted
 * map1.set('active', true);   // ✓ boolean accepted
 * // map1.set('age', 'text'); // ✗ Type error: string not assignable to number
 *
 * // Type-safe get operations
 * const name = map2.get('name');     // string | undefined
 * const age = map2.get('age');       // number | undefined
 * const active = map2.get('active'); // boolean | undefined
 *
 * // Other Map operations
 * map2.has('name');    // boolean
 * map2.delete('age');  // boolean
 * map2.size;           // number
 * map2.clear();        // void
 * ```
 *
 * @example
 * ```typescript
 * // With number keys (e.g., COSE headers)
 * const coseEntries = [
 *   [1, z.number()],  // Algorithm (alg)
 *   [4, z.string()],  // Key ID (kid)
 * ] as const;
 *
 * // Create with initial values
 * const headers = createStrictMap<typeof coseEntries>([
 *   [1, -7],
 *   [4, 'key-123'],
 * ]);
 *
 * const alg = headers.get(1);   // number | undefined
 * const kid = headers.get(4);   // string | undefined
 * ```
 *
 * @example
 * ```typescript
 * // Compatible with cbor-x (using encodeCbor/decodeCbor)
 * import { encodeCbor, decodeCbor } from '../../../cbor/codec';
 *
 * const map = createStrictMap<typeof entries>([
 *   ['name', 'Alice'],
 *   ['age', 25],
 * ]);
 *
 * const encoded = encodeCbor(map); // Works! Map is serialized as CBOR map (major type 5)
 * const decoded = decodeCbor(encoded); // Decoded as Map
 * ```
 */
export const createStrictMap = <T extends StrictMapEntries>(
  entries?: Iterable<EntryTuples<T>>
): StrictMap<T> => new Map(entries) as StrictMap<T>;
