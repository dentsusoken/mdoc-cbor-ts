import { z } from 'zod';
import { mapInvalidTypeMessage } from './Map';
import { createRequiredSchema } from './Required';

/**
 * Mode for handling unknown keys in StrictMap schemas
 * @description
 * Defines how the schema handles keys that are not defined in the entries array:
 * - 'strip': Remove unknown keys from the output (default, safest option)
 * - 'passthrough': Include unknown keys in the output as-is
 * - 'strict': Throw a validation error if unknown keys are present
 *
 * This mirrors Zod's object handling (.strip(), .passthrough(), .strict())
 */
type UnknownKeysMode = 'strip' | 'passthrough' | 'strict';

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
 * Type that combines StrictMapEntries with UnknownKeys constraint
 * @description
 * This type is used to define both the known entries and the allowed unknown key types
 * for a StrictMap that supports unknown keys via UnknownStrictMapBuilder.
 *
 * @template T - The entries type (must extend StrictMapEntries)
 * @template U - The unknown key type constraint (string | number)
 *
 * @example
 * ```typescript
 * type DecodedProtectedHeadersParams = StrictMapEntriesWithUnknownKeys<
 *   typeof decodedProtectedHeadersEntries,
 *   Headers
 * >;
 * ```
 */
export type StrictMapEntriesWithUnknownKeys<
  T extends StrictMapEntries,
  U extends string | number,
> = {
  readonly entries: T;
  readonly unknownKeys: U;
};

/**
 * Extract the entries type from StrictMapEntriesWithUnknownKeys
 * @description
 * Utility type to extract just the entries array from a StrictMapEntriesWithUnknownKeys type.
 * Used internally by helper functions to decompose the consolidated type parameter.
 *
 * @template P - Type with an 'entries' property
 *
 * @example
 * ```typescript
 * type MyParams = StrictMapEntriesWithUnknownKeys<typeof myEntries, MyUnknownKeys>;
 * type Entries = ExtractEntriesFromParams<MyParams>; // typeof myEntries
 * ```
 */
type ExtractEntriesFromParams<P extends { entries: StrictMapEntries }> =
  P['entries'];

/**
 * Extract the unknown keys type from StrictMapEntriesWithUnknownKeys
 * @description
 * Utility type to extract just the unknown key type constraint from a StrictMapEntriesWithUnknownKeys type.
 * Used internally by helper functions to decompose the consolidated type parameter.
 *
 * @template P - Type with an 'unknownKeys' property
 *
 * @example
 * ```typescript
 * type MyParams = StrictMapEntriesWithUnknownKeys<typeof myEntries, MyUnknownKeys>;
 * type UnknownKeys = ExtractUnknownKeysFromParams<MyParams>; // MyUnknownKeys
 * ```
 */
type ExtractUnknownKeysFromParams<P extends { unknownKeys: string | number }> =
  P['unknownKeys'];

/**
 * Configuration parameters for createStrictMapSchema
 * @description
 * Defines the structure and validation behavior for a StrictMap schema.
 *
 * @template T - The entries array type
 * @template U - The unknown key type constraint (default: never)
 *
 * @property target - Name used in error messages (e.g., "DeviceAuth", "ProtectedHeaders")
 * @property entries - Readonly array of [key, schema] tuples defining the map structure
 * @property unknownKeys - How to handle keys not defined in entries (default: 'strip')
 *   - 'strip': Remove unknown keys from output
 *   - 'passthrough': Include unknown keys in output
 *   - 'strict': Throw error if unknown keys are present
 * @property unknownKeyType - Type constraint for unknown keys (used with passthrough mode)
 */
type CreateStrictMapParams<
  T extends StrictMapEntries,
  U extends string | number = never,
> = {
  target: string;
  entries: T;
  unknownKeys?: UnknownKeysMode;
  unknownKeyType?: U;
};

/**
 * Extract key type from entries (union of all keys)
 * @description
 * Creates a union type of all key literals from the entries array.
 *
 * @template T - The entries array type
 *
 * @example
 * ```typescript
 * const entries = [['name', z.string()], ['age', z.number()]] as const;
 * type Keys = ExtractKeys<typeof entries>; // 'name' | 'age'
 * ```
 */
type ExtractKeys<T extends StrictMapEntries> = T[number][0];

/**
 * Extract value type from entries (union of all inferred schema types)
 * @description
 * Creates a union type of all output types from the schemas in the entries array.
 *
 * @template T - The entries array type
 *
 * @example
 * ```typescript
 * const entries = [['name', z.string()], ['age', z.number()]] as const;
 * type Values = ExtractValues<typeof entries>; // string | number
 * ```
 */
type ExtractValues<T extends StrictMapEntries> = z.infer<T[number][1]>;

/**
 * Extract the schema for a specific key
 * @description
 * Retrieves the Zod schema associated with a specific key from the entries array.
 *
 * @template T - The entries array type
 * @template K - The key to look up
 *
 * @example
 * ```typescript
 * const entries = [['name', z.string()], ['age', z.number()]] as const;
 * type NameSchema = GetSchemaForKey<typeof entries, 'name'>; // z.ZodString
 * ```
 */
type GetSchemaForKey<
  T extends StrictMapEntries,
  K extends string | number,
> = Extract<
  T[number],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly [K, any]
>[1];

/**
 * Extract the input type for a specific key's schema
 * @description
 * Retrieves the input type of the Zod schema associated with a specific key.
 * This is the type that the builder's set() method expects for that key.
 *
 * @template T - The entries array type
 * @template K - The key to look up
 *
 * @example
 * ```typescript
 * const entries = [['name', z.string()], ['age', z.number()]] as const;
 * type NameInput = GetInputTypeForKey<typeof entries, 'name'>; // string
 * ```
 */
type GetInputTypeForKey<
  T extends StrictMapEntries,
  K extends string | number,
> = z.input<GetSchemaForKey<T, K>>;

/**
 * Type-safe Map builder for StrictMap schemas
 * @description
 * Each `.set()` call enforces the correct value type for the given key.
 * - For 'name' with z.string(), only string values are accepted
 * - For 'age' with z.number(), only number values are accepted
 * - For number keys (e.g., COSE header labels), the same type checking applies
 */
class StrictMapBuilder<T extends StrictMapEntries> {
  protected readonly map: Map<string | number, unknown>;

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
 * - Autocomplete for valid keys (string or number)
 * - Specific type checking for each key's value
 *
 * Each key only accepts values matching its schema's input type:
 * - `'age'` with `z.number()` → only accepts `number`
 * - `'name'` with `z.string()` → only accepts `string`
 * - `1` with `z.number()` → only accepts `number` (for COSE algorithm label)
 *
 * @template T - The entries array type (must be `as const`)
 *
 * @example
 * ```typescript
 * // String keys
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
 * ```
 *
 * @example
 * ```typescript
 * // Number keys (e.g., COSE protected headers)
 * const coseEntries = [
 *   [1, z.number()],  // Algorithm (alg)
 *   [4, z.string()],  // Key ID (kid)
 * ] as const;
 *
 * const coseHeaders = createStrictMapBuilder<typeof coseEntries>()
 *   .set(1, -7)           // ✓ ES256 algorithm
 *   .set(4, 'key-123')    // ✓ Key ID
 *   .build();
 * ```
 */
export const createStrictMapBuilder = <
  T extends StrictMapEntries,
>(): StrictMapBuilder<T> => new StrictMapBuilder();

/**
 * Map builder with unknown keys support
 * @description
 * This builder extends StrictMapBuilder functionality with the ability to add
 * unknown keys that are not defined in the entries schema. This is useful when:
 * - Working with dynamic data that may contain additional fields
 * - Using 'passthrough' mode to preserve unknown keys
 * - Handling data with optional unknown metadata
 *
 * @template T - The entries array type defining known keys
 * @template U - The type constraint for unknown keys (default: `string | number`)
 *               Use this to restrict unknown keys to specific types:
 *               - `string` - only allow unknown string keys
 *               - `number` - only allow unknown number keys
 *               - `string | number` - allow both (default)
 */
class UnknownStrictMapBuilder<
  T extends StrictMapEntries,
  U extends string | number = string | number,
> extends StrictMapBuilder<T> {
  /**
   * Set an unknown key-value pair (not defined in the entries schema)
   * @param key - A key of type U (string, number, or both depending on the U type parameter)
   * @param value - Any value
   * @returns This builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Default: allows both string and number unknown keys
   * const input1 = createUnknownStrictMapBuilder<typeof entries>()
   *   .set('name', 'Alice')             // ✓ known key with type checking
   *   .setUnknown('metadata', { ... })  // ✓ unknown string key
   *   .setUnknown(99, 'value')          // ✓ unknown number key
   *   .build();
   *
   * // Restrict to only number unknown keys
   * const input2 = createUnknownStrictMapBuilder<typeof entries, number>()
   *   .set('name', 'Bob')               // ✓ known key with type checking
   *   .setUnknown(42, 'data')           // ✓ unknown number key
   *   // .setUnknown('x', 'val')        // ✗ Type error: string not assignable to number
   *   .build();
   * ```
   */
  setUnknown(key: U, value: unknown): this {
    this.map.set(key, value);
    return this;
  }

  /**
   * Build the final Map with known and unknown keys
   * @returns A Map that can contain both known keys (typed) and unknown keys of type U
   */
  override build(): Map<ExtractKeys<T> | U, ExtractValues<T> | unknown> {
    return this.map as Map<ExtractKeys<T> | U, ExtractValues<T> | unknown>;
  }
}

/**
 * Creates a Map builder with support for unknown keys
 * @description
 * This builder allows adding both known keys (with type checking) and unknown keys
 * (without type checking). This is useful when working with:
 * - Dynamic data that may contain additional fields
 * - Schemas with 'passthrough' or 'strip' unknownKeys mode
 * - Data sources that include optional metadata or extensions
 *
 * For strict type safety where only defined keys are allowed, use `createStrictMapBuilder`.
 *
 * @template T - The entries array type (must be `as const`)
 * @template U - The type constraint for unknown keys (default: `string | number`)
 *               Specify this to restrict what types of unknown keys are allowed:
 *               - Omit for both string and number keys (default)
 *               - `string` to only allow unknown string keys
 *               - `number` to only allow unknown number keys
 *
 * @example
 * ```typescript
 * // Default: allows both string and number unknown keys
 * const entries = [
 *   ['family_name', z.string()],
 *   ['given_name', z.string()],
 * ] as const;
 *
 * const input1 = createUnknownStrictMapBuilder<typeof entries>()
 *   .set('family_name', 'Doe')          // ✓ type-safe known key
 *   .set('given_name', 'John')          // ✓ type-safe known key
 *   .setUnknown('custom_field', 'data') // ✓ unknown string key
 *   .setUnknown(99, 'metadata')         // ✓ unknown number key
 *   .build();
 * ```
 *
 * @example
 * ```typescript
 * // Restrict unknown keys to numbers only (e.g., COSE headers with numeric labels)
 * const coseEntries = [
 *   [1, z.number()],  // alg
 *   [4, z.string()],  // kid
 * ] as const;
 *
 * const input2 = createUnknownStrictMapBuilder<typeof coseEntries, number>()
 *   .set(1, -7)                    // ✓ known key (algorithm)
 *   .setUnknown(5, 'iv-value')     // ✓ unknown number key
 *   // .setUnknown('x', 'val')     // ✗ Type error: string not allowed
 *   .build();
 * ```
 */
export const createUnknownStrictMapBuilder = <
  T extends StrictMapEntries,
  U extends string | number = string | number,
>(): UnknownStrictMapBuilder<T, U> => new UnknownStrictMapBuilder();

/**
 * Extract entries type from UnknownStrictMapBuilder
 * @description
 * Utility type to extract the entries type (T) from an UnknownStrictMapBuilder instance type
 */
export type ExtractBuilderEntries<B> =
  B extends UnknownStrictMapBuilder<infer T, string | number> ? T : never;

/**
 * Extract unknown key type from UnknownStrictMapBuilder
 * @description
 * Utility type to extract the unknown key type (U) from an UnknownStrictMapBuilder instance type
 */
export type ExtractBuilderUnknownKeyType<B> =
  B extends UnknownStrictMapBuilder<StrictMapEntries, infer U> ? U : never;

/**
 * Extract known keys from entries
 * @description
 * Same as ExtractKeys, but with a more descriptive name for use in typed get() scenarios.
 * Creates a union type of all key literals defined in the entries array.
 *
 * @template T - The entries array type
 *
 * @example
 * ```typescript
 * const entries = [['name', z.string()], ['age', z.number()]] as const;
 * type Known = ExtractKnownKeys<typeof entries>; // 'name' | 'age'
 * ```
 */
type ExtractKnownKeys<T extends StrictMapEntries> = T[number][0];

/**
 * Extract value type for a specific key
 * @description
 * Retrieves the output type of the Zod schema for a specific key.
 * This is the type returned by map.get() for that key.
 *
 * @template T - The entries array type
 * @template K - The key to look up (must be a known key)
 *
 * @example
 * ```typescript
 * const entries = [['name', z.string()], ['age', z.number()]] as const;
 * type NameValue = ExtractValueTypeForKey<typeof entries, 'name'>; // string
 * type AgeValue = ExtractValueTypeForKey<typeof entries, 'age'>; // number
 * ```
 */
type ExtractValueTypeForKey<
  T extends StrictMapEntries,
  K extends ExtractKnownKeys<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = z.infer<Extract<T[number], readonly [K, z.ZodType<any, any, any>]>[1]>;

/**
 * Create get method overloads for all known keys
 * @description
 * Creates a conditional type for the Map's get() method that returns:
 * - Specific type | undefined for known keys (keys defined in entries)
 * - unknown for unknown keys (keys within AllKeys but not in entries)
 *
 * This enables type-safe access to map values with autocomplete for known keys.
 *
 * @template T - The entries array type
 * @template AllKeys - All allowed keys (known + unknown)
 *
 * @example
 * ```typescript
 * const entries = [['alg', z.number()]] as const;
 * type Get = GetMethodOverloads<typeof entries, Headers>;
 *
 * // For known key:
 * const alg = map.get(Headers.Algorithm);    // number | undefined
 *
 * // For unknown key:
 * const contentType = map.get(Headers.ContentType); // unknown
 * ```
 */
type GetMethodOverloads<
  T extends StrictMapEntries,
  AllKeys extends string | number,
> = <K extends AllKeys>(
  key: K
) => K extends ExtractKnownKeys<T>
  ? ExtractValueTypeForKey<T, K> | undefined
  : unknown;

/**
 * Create a Map type with overloaded get method from builder
 * @description
 * Creates a Map type where:
 * - The Map is based on the builder's build() result
 * - The get() method is overloaded to return specific types for known keys
 * - Unknown keys return unknown
 *
 * @template B - The builder type (ReturnType of createUnknownStrictMapBuilder)
 *
 * @example
 * ```typescript
 * type Builder = ReturnType<typeof createMyBuilder>;
 * export type MyMap = MapWithTypedGet<Builder>;
 *
 * const map: MyMap = ...;
 * map.get(KnownKey);   // Returns specific type
 * map.get(UnknownKey); // Returns unknown
 * ```
 */
export type MapWithTypedGet<B> =
  B extends UnknownStrictMapBuilder<infer T, infer U>
    ? Omit<Map<ExtractKeys<T> | U, ExtractValues<T> | unknown>, 'get'> & {
        get: GetMethodOverloads<T, U>;
      }
    : never;

/**
 * Create a Map type with typed get method from entries and unknown key type
 * @description
 * Directly creates a Map type with overloaded get() methods from entries definition.
 * This type provides:
 * - All standard Map methods (set, has, delete, etc.)
 * - Type-safe get() method with specific return types for known keys
 * - unknown return type for unknown keys
 *
 * Use this when you want to define a Map type directly from entries without going through a builder.
 *
 * @template T - The entries array type
 * @template U - The unknown key type constraint (string | number or specific enum)
 *
 * @example
 * ```typescript
 * const entries = [['alg', z.number()]] as const;
 * type Headers = 1 | 2 | 3 | 4; // Algorithm, IV, ContentType, KeyId
 *
 * type MyMap = MapWithTypedGetFromEntries<typeof entries, Headers>;
 *
 * const map: MyMap = ...;
 * const alg = map.get(1);    // number | undefined (known key)
 * const iv = map.get(2);     // unknown (unknown key)
 * map.set(1, -7);            // OK
 * map.has(3);                // boolean
 * ```
 *
 * @example
 * ```typescript
 * // With enum keys
 * enum Headers { Algorithm = 1, ContentType = 3 }
 * const entries = [['alg', z.number()]] as const;
 *
 * type DecodedHeaders = MapWithTypedGetFromEntries<typeof entries, Headers>;
 *
 * const headers: DecodedHeaders = ...;
 * headers.get(Headers.Algorithm);    // number | undefined
 * headers.get(Headers.ContentType);  // unknown
 * ```
 */
export type MapWithTypedGetFromEntries<
  T extends StrictMapEntries,
  U extends string | number,
> = {
  [K in keyof Omit<
    Map<ExtractKeys<T> | U, ExtractValues<T> | unknown>,
    'get'
  >]: K extends 'get'
    ? never
    : Map<ExtractKeys<T> | U, ExtractValues<T> | unknown>[K];
} & {
  get: GetMethodOverloads<T, U>;
};

/**
 * Create a builder factory function with entries and unknown key types
 * @description
 * Helper type to avoid repeating type parameters for createUnknownStrictMapBuilder
 *
 * @template T - The entries type
 * @template U - The unknown key type constraint
 *
 * @example
 * ```typescript
 * const createMyBuilder: BuilderFactory<typeof myEntries, MyUnknownKeys> = () =>
 *   createUnknownStrictMapBuilder<typeof myEntries, MyUnknownKeys>();
 * ```
 */
export type BuilderFactory<
  T extends StrictMapEntries,
  U extends string | number,
> = () => ReturnType<typeof createUnknownStrictMapBuilder<T, U>>;

/**
 * Define a builder factory with type parameters specified once
 * @description
 * Creates a builder factory function where type parameters are specified only once.
 * This avoids repetition of type parameters in both type annotation and implementation.
 *
 * @template T - The entries type
 * @template U - The unknown key type constraint
 *
 * @example
 * ```typescript
 * export const createDecodedProtectedHeadersBuilder = defineBuilderFactory<
 *   typeof decodedProtectedHeadersEntries,
 *   Headers
 * >();
 * ```
 */
export const defineBuilderFactory =
  <T extends StrictMapEntries, U extends string | number>(): BuilderFactory<
    T,
    U
  > =>
  () =>
    createUnknownStrictMapBuilder<T, U>();

/**
 * Define a builder factory with StrictMapEntriesWithUnknownKeys type parameter
 * @description
 * Similar to defineBuilderFactory but accepts a StrictMapEntriesWithUnknownKeys type.
 * This allows defining both entries and unknown key type in a single type alias.
 *
 * @template P - StrictMapEntriesWithUnknownKeys type
 *
 * @example
 * ```typescript
 * type MyParams = StrictMapEntriesWithUnknownKeys<
 *   typeof myEntries,
 *   MyUnknownKeys
 * >;
 * export const createMyBuilder = defineBuilderFactoryWithUnknownKeys<MyParams>();
 * ```
 */
export const defineBuilderFactoryWithUnknownKeys = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends StrictMapEntriesWithUnknownKeys<any, any>,
>(): (() => Pick<
  UnknownStrictMapBuilder<
    ExtractEntriesFromParams<P>,
    ExtractUnknownKeysFromParams<P>
  >,
  'set' | 'setUnknown' | 'build'
>) => {
  return (() =>
    createUnknownStrictMapBuilder<
      ExtractEntriesFromParams<P>,
      ExtractUnknownKeysFromParams<P>
    >()) as () => Pick<
    UnknownStrictMapBuilder<
      ExtractEntriesFromParams<P>,
      ExtractUnknownKeysFromParams<P>
    >,
    'set' | 'setUnknown' | 'build'
  >;
};

/**
 * Create a schema with StrictMapEntriesWithUnknownKeys type parameter
 * @description
 * Similar to createStrictMapSchema but accepts a StrictMapEntriesWithUnknownKeys type.
 * This allows defining both entries and unknown key type in a single type alias.
 *
 * @template P - StrictMapEntriesWithUnknownKeys type
 * @template OutputType - Optional output type override for the schema
 */
export const createStrictMapSchemaWithUnknownKeys = <
  P extends StrictMapEntriesWithUnknownKeys<any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  OutputType = never,
>(
  params: CreateStrictMapParams<
    ExtractEntriesFromParams<P>,
    ExtractUnknownKeysFromParams<P>
  >
): OutputType extends never
  ? CreateStrictMapSchemaReturnType<
      ExtractEntriesFromParams<P>,
      ExtractUnknownKeysFromParams<P>
    >
  : z.ZodType<OutputType, z.ZodTypeDef, Map<string | number, unknown>> => {
  const { target, entries, unknownKeys = 'strip' } = params;
  return createRequiredSchema(target).pipe(
    createStrictMapInnerSchema({ target, entries, unknownKeys })
  ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const createStrictMapInnerSchema = <T extends StrictMapEntries>({
  target,
  entries,
  unknownKeys = 'strip',
}: CreateStrictMapParams<T>): z.ZodType<
  Map<ExtractKeys<T>, ExtractValues<T>>,
  z.ZodTypeDef,
  Map<string | number, unknown>
> => {
  const keySet = new Set(entries.map(([key]) => key));

  return z
    .map(z.union([z.string(), z.number()]), z.any(), {
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
 * Return type for createStrictMapSchema
 * @description
 * Determines the output type of the schema based on whether unknown keys are allowed:
 * - If U is never: Returns a standard Map type with known keys only
 * - If U is specified: Returns MapWithTypedGetFromEntries with typed get() overloads
 *
 * @template T - The entries array type
 * @template U - The unknown key type constraint
 *
 * @example
 * ```typescript
 * // Without unknown keys (U = never)
 * type Schema1 = CreateStrictMapSchemaReturnType<typeof entries, never>;
 * // z.ZodType<Map<'name' | 'age', string | number>, ...>
 *
 * // With unknown keys (U = Headers)
 * type Schema2 = CreateStrictMapSchemaReturnType<typeof entries, Headers>;
 * // z.ZodType<MapWithTypedGetFromEntries<typeof entries, Headers>, ...>
 * ```
 */
type CreateStrictMapSchemaReturnType<
  T extends StrictMapEntries,
  U extends string | number,
> = [U] extends [never]
  ? z.ZodType<
      Map<ExtractKeys<T>, ExtractValues<T>>,
      z.ZodTypeDef,
      Map<string | number, unknown>
    >
  : z.ZodType<
      MapWithTypedGetFromEntries<T, U>,
      z.ZodTypeDef,
      Map<string | number, unknown>
    >;

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
 * @template U - The unknown key type (for passthrough mode)
 *
 * @param params - Configuration object
 * @param params.target - Name used in error messages (e.g., "DeviceAuth")
 * @param params.entries - Readonly array of [key, schema] tuples defining the expected structure and order
 *                        Use `as const` to preserve literal types for better type inference
 * @param params.unknownKeys - How to handle unknown keys (default: 'strip')
 *   - 'strip': Remove unknown keys from output (default behavior)
 *   - 'passthrough': Include unknown keys in output
 *   - 'strict': Throw an error if unknown keys are present
 * @param params.unknownKeyType - Type constraint for unknown keys (only used with passthrough mode)
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
export const createStrictMapSchema = <T extends StrictMapEntries>({
  target,
  entries,
  unknownKeys = 'strip',
}: Omit<
  CreateStrictMapParams<T, never>,
  'unknownKeyType'
>): CreateStrictMapSchemaReturnType<T, never> =>
  createRequiredSchema(target).pipe(
    createStrictMapInnerSchema({ target, entries, unknownKeys })
  ) as unknown as CreateStrictMapSchemaReturnType<T, never>;
