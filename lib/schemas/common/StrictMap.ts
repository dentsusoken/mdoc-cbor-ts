import { z } from 'zod';
import { mapInvalidTypeMessage } from './Map';
import { createRequiredSchema } from './Required';

type UnknownKeysMode = 'strip' | 'passthrough' | 'strict';

type CreateStrictMapParams<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ReadonlyArray<readonly [string, z.ZodType<any, any, any>]>,
> = {
  target: string;
  entries: T;
  unknownKeys?: UnknownKeysMode;
};

// Extract key type from entries (union of all keys)
type ExtractKeys<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ReadonlyArray<readonly [string, z.ZodType<any, any, any>]>,
> = T[number][0];

// Extract value type from entries (union of all inferred schema types)
type ExtractValues<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ReadonlyArray<readonly [string, z.ZodType<any, any, any>]>,
> = z.infer<T[number][1]>;

// Extract the schema for a specific key
type GetSchemaForKey<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ReadonlyArray<readonly [string, z.ZodType<any, any, any>]>,
  K extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = Extract<T[number], readonly [K, any]>[1];

// Extract the input type for a specific key's schema
type GetInputTypeForKey<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ReadonlyArray<readonly [string, z.ZodType<any, any, any>]>,
  K extends string,
> = z.input<GetSchemaForKey<T, K>>;

/**
 * Type-safe Map builder for StrictMap schemas
 * @description
 * Each `.set()` call enforces the correct value type for the given key.
 * - For 'name' with z.string(), only string values are accepted
 * - For 'age' with z.number(), only number values are accepted
 */
class StrictMapBuilder<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ReadonlyArray<readonly [string, z.ZodType<any, any, any>]>,
> {
  private readonly map: Map<string, unknown>;

  constructor() {
    this.map = new Map();
  }

  /**
   * Set a value for a specific key with type safety
   * @template K - The key literal type
   * @param key - The key to set (autocompletes with valid keys)
   * @param value - The value, typed according to the key's schema
   * @example
   * ```typescript
   * builder
   *   .set('age', 25)      // ✓ accepts number for 'age'
   *   .set('age', 'text')  // ✗ type error: string not assignable to number
   *   .set('name', 'John') // ✓ accepts string for 'name'
   * ```
   */
  set<K extends ExtractKeys<T>>(key: K, value: GetInputTypeForKey<T, K>): this {
    this.map.set(key, value);
    return this;
  }

  /**
   * Build the final Map with typed keys and values
   * @returns A Map where keys are the union of all defined key literals
   *          and values are the union of all schema output types
   */
  build(): Map<ExtractKeys<T>, ExtractValues<T>> {
    return this.map as Map<ExtractKeys<T>, ExtractValues<T>>;
  }
}

/**
 * Creates a type-safe Map builder with per-key type checking
 * @description
 * This function provides a type-safe way to build input Maps with:
 * - Autocomplete for valid keys
 * - Specific type checking for each key's value
 *
 * Each key only accepts values matching its schema's input type:
 * - `'age'` with `z.number()` → only accepts `number`
 * - `'name'` with `z.string()` → only accepts `string`
 * - `'tags'` with `z.array(z.string())` → only accepts `string[]`
 *
 * @template T - The entries array type (must be `as const`)
 *
 * @example
 * ```typescript
 * const entries = [
 *   ['name', z.string()],
 *   ['age', z.number()],
 *   ['active', z.boolean()],
 * ] as const;
 *
 * const input = createStrictMapBuilder<typeof entries>()
 *   .set('name', 'Alice')   // ✓ string accepted
 *   .set('age', 25)         // ✓ number accepted
 *   .set('active', true)    // ✓ boolean accepted
 *   // .set('age', 'text')  // ✗ Type error: string not assignable to number
 *   .build();
 *
 * const schema = createStrictMapSchema({
 *   target: 'Person',
 *   entries,
 * });
 *
 * const result = schema.parse(input);
 * ```
 */
export const createStrictMapBuilder = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ReadonlyArray<readonly [string, z.ZodType<any, any, any>]>,
>(): StrictMapBuilder<T> => new StrictMapBuilder();

const createStrictMapInnerSchema = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ReadonlyArray<readonly [string, z.ZodType<any, any, any>]>,
>({
  target,
  entries,
  unknownKeys = 'strip',
}: CreateStrictMapParams<T>): z.ZodType<
  Map<ExtractKeys<T>, ExtractValues<T>>,
  z.ZodTypeDef,
  Map<string, unknown>
> => {
  const keySet = new Set(entries.map(([key]) => key));

  return z
    .map(z.string(), z.any(), {
      invalid_type_error: mapInvalidTypeMessage(target),
    })
    .transform((inputMap) => {
      // Handle unknown keys based on mode
      if (unknownKeys === 'strict') {
        for (const key of inputMap.keys()) {
          if (!keySet.has(key)) {
            throw new z.ZodError([
              {
                code: 'custom',
                message: `${target} contains unexpected key: ${key}`,
                path: [],
              },
            ]);
          }
        }
      }

      // Validate each value with its schema and build output map in defined order
      // If a key doesn't exist in the input, pass undefined to the schema
      // (the schema will validate whether it's required or optional)
      const outputMap = new Map<ExtractKeys<T>, ExtractValues<T>>();
      for (const [key, schema] of entries) {
        const value = inputMap.get(key);
        const parsedValue = schema.parse(value);

        // Only add to output map if the parsed value is not undefined
        // or if the key was present in the input
        if (parsedValue !== undefined || inputMap.has(key)) {
          outputMap.set(key as ExtractKeys<T>, parsedValue);
        }
      }

      // Handle passthrough mode: add unknown keys to output
      if (unknownKeys === 'passthrough') {
        for (const [key, value] of inputMap.entries()) {
          if (!keySet.has(key)) {
            outputMap.set(key as ExtractKeys<T>, value);
          }
        }
      }

      return outputMap;
    }) as z.ZodType<
    Map<ExtractKeys<T>, ExtractValues<T>>,
    z.ZodTypeDef,
    Map<string, unknown>
  >;
};

/**
 * Creates a schema that validates a Map and returns a Map with guaranteed order
 * @description
 * This function creates a Zod schema that:
 * - Accepts a `Map<string, unknown>` as input
 * - Validates each value against its corresponding schema (supports both required and optional schemas)
 * - Handles unknown keys based on the `unknownKeys` mode (similar to z.object()'s `.strip()`, `.passthrough()`, `.strict()`)
 * - Returns a new `Map<K, V>` where K is the union of all keys and V is the union of all value types from the schemas
 *
 * The output Map always has the same key order regardless of the input Map's order.
 * Keys with `z.optional()` schemas may be omitted from the input without causing an error.
 *
 * @template T - The readonly array of [key, schema] tuples
 *
 * @param params - Configuration object
 * @param params.target - Name used in error messages (e.g., "DeviceAuth")
 * @param params.entries - Readonly array of [key, schema] tuples defining the expected structure and order
 *                        Use `as const` to preserve literal types for better type inference
 * @param params.unknownKeys - How to handle unknown keys (default: 'strip')
 *   - 'strip': Remove unknown keys from output (default behavior)
 *   - 'passthrough': Include unknown keys in output
 *   - 'strict': Throw an error if unknown keys are present
 *
 * @returns A Zod schema that validates and normalizes Map input, typed as `Map<K, V>` where:
 *   - K is the union of all key literals
 *   - V is the union of all inferred schema output types
 *
 * @example
 * ```typescript
 * // strip mode (default): extra keys are removed
 * const schema1 = createStrictMapSchema({
 *   target: 'Person',
 *   entries: [
 *     ['family_name', z.string()],
 *     ['given_name', z.string()],
 *     ['age', z.number().optional()],
 *   ] as const,
 *   unknownKeys: 'strip', // or omit this line
 * });
 * // Type: z.ZodType<Map<'family_name' | 'given_name' | 'age', string | number>>
 *
 * const result1 = schema1.parse(new Map([
 *   ['family_name', 'Doe'],
 *   ['given_name', 'John'],
 *   ['extra_key', 'ignored'],
 * ]));
 * // result1: Map<'family_name' | 'given_name' | 'age', string | number>
 * // result1: Map { 'family_name' => 'Doe', 'given_name' => 'John' }
 *
 * // passthrough mode: extra keys are included
 * const schema2 = createStrictMapSchema({
 *   target: 'Person',
 *   entries: [
 *     ['family_name', z.string()],
 *     ['given_name', z.string()],
 *   ] as const,
 *   unknownKeys: 'passthrough',
 * });
 *
 * const result2 = schema2.parse(new Map([
 *   ['family_name', 'Doe'],
 *   ['given_name', 'John'],
 *   ['extra_key', 'kept'],
 * ]));
 * // result2: Map { 'family_name' => 'Doe', 'given_name' => 'John', 'extra_key' => 'kept' }
 *
 * // strict mode: extra keys cause an error
 * const schema3 = createStrictMapSchema({
 *   target: 'Person',
 *   entries: [
 *     ['family_name', z.string()],
 *     ['given_name', z.string()],
 *   ] as const,
 *   unknownKeys: 'strict',
 * });
 *
 * schema3.parse(new Map([
 *   ['family_name', 'Doe'],
 *   ['given_name', 'John'],
 *   ['extra_key', 'error'],
 * ])); // Throws ZodError: Person contains unexpected key: extra_key
 * ```
 */
export const createStrictMapSchema = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ReadonlyArray<readonly [string, z.ZodType<any, any, any>]>,
>({
  target,
  entries,
  unknownKeys = 'strip',
}: CreateStrictMapParams<T>): z.ZodType<
  Map<ExtractKeys<T>, ExtractValues<T>>,
  z.ZodTypeDef,
  Map<string, unknown>
> =>
  createRequiredSchema(target).pipe(
    createStrictMapInnerSchema({ target, entries, unknownKeys })
  );
