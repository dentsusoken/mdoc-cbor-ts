import { z } from 'zod';
import type { StrictMap, StrictMapEntries } from '@/strict-map/types';
import { getTypeName } from '@/utils/getTypeName';
import { containerInvalidValueMessage } from '../messages/containerInvalidValueMessage';
import { containerInvalidTypeMessage } from '../messages/containerInvalidTypeMessage';

/**
 * Mode for handling unknown keys in StrictMap schemas
 * @description
 * Defines how the schema handles keys that are not defined in the entries array:
 * - 'strip': Remove unknown keys from the output (default, safest option)
 * - 'strict': Throw a validation error if unknown keys are present
 *
 * Note: 'passthrough' is not available for StrictMap as it contradicts the strict nature
 */
type UnknownKeysMode = 'strip' | 'strict';

/**
 * Creates an error message when required keys are missing
 * @param target - The name of the target schema being validated
 * @param keys - Array of missing key names
 * @returns A formatted error message string
 */
export const strictMapMissingKeysMessage = (
  target: string,
  keys: (string | number)[]
): string => `${target}: Missing required keys: ${keys.join(', ')}`;

/**
 * Creates an error message when unexpected keys are present
 * @param target - The name of the target schema being validated
 * @param keys - Array of unexpected key names
 * @returns A formatted error message string
 */
export const strictMapUnexpectedKeysMessage = (
  target: string,
  keys: (string | number)[]
): string => `${target}: Unexpected keys: ${keys.join(', ')}`;

type BuildEntriesIndexResult = {
  schemaMap: Map<string | number, z.ZodType>;
  requiredKeys: Set<string | number>;
  allKeys: Set<string | number>;
};

/**
 * Builds indexes for entries of a StrictMap schema.
 *
 * Iterates over each entry `[key, schema]` and creates:
 * - `schemaMap`: maps keys to their Zod schemas for quick lookup.
 * - `requiredKeys`: all keys whose schemas are NOT optional (i.e., must be present in the input).
 * - `allKeys`: all declared keys. If `unknownKeys` is `'strict'`, allKeys includes only the declared keys (used for unknown key error checking).
 *
 * @param entries - Array of `[key, schema]` tuples, usually as `as const`.
 * @param unknownKeys - Determines handling for unknown keys, can be `'strip'`, `'passthrough'`, or `'strict'`.
 * @returns An object containing `schemaMap`, `requiredKeys`, and `allKeys`.
 *
 * @example
 * const entries = [
 *   ['name', z.string()],
 *   ['age', z.number()],
 *   ['active', z.boolean().optional()],
 * ] as const;
 * const { schemaMap, requiredKeys, allKeys } = buildEntriesIndex(entries, 'strict');
 * // schemaMap.get('name') is z.string()
 * // requiredKeys contains 'name' and 'age'
 * // allKeys contains 'name', 'age', 'active'
 */
export const buildEntriesIndex = (
  entries: StrictMapEntries,
  unknownKeys?: UnknownKeysMode
): BuildEntriesIndexResult => {
  const schemaMap = new Map<string | number, z.ZodType>();
  const requiredKeys = new Set<string | number>();
  const allKeys = new Set<string | number>();

  for (const [key, schema] of entries) {
    schemaMap.set(key, schema);

    if (unknownKeys === 'strict') {
      allKeys.add(key);
    }

    allKeys.add(key);

    // Check if the schema is optional
    if (!schema.isOptional()) {
      requiredKeys.add(key);
    }
  }

  return { schemaMap, requiredKeys, allKeys };
};

/**
 * Validate values for declared keys and collect them into an output map.
 * Optionally include unknown keys as-is (passthroughMode=true for SemiStrictMap).
 */
type ValidateAndCollectKnownEntriesParams = {
  /** Name of the schema for prefixing error messages */
  target: string;
  /** Input map being validated */
  inputMap: Map<unknown, unknown>;
  /** Lookup of declared keys to their Zod schemas */
  schemaMap: Map<string | number, z.ZodType>;
  /** Zod refinement context for reporting issues */
  ctx: z.RefinementCtx;
  /** When true, unknown keys are copied to output (passthrough); otherwise they are ignored (strip) */
  passthroughMode?: boolean;
};

/**
 * Validates values for declared keys in a Map using provided Zod schemas, and collects them into an output map.
 * Optionally includes unknown keys as-is if `passthroughMode` is enabled (typically for semi-strict validation).
 *
 * - For each entry in the input map:
 *   - If the key is declared in `schemaMap`, validate the value using its Zod schema.
 *     - If validation fails, issues are added to the provided Zod refinement context (`ctx`)
 *       with path and a custom error message using `strictMapKeyValueMessage`.
 *     - If validation succeeds, the parsed value is included in the output map.
 *   - If the key is not declared but `passthroughMode` is true, include the key-value pair in the output unmodified.
 * - Keys with values `undefined` are included if explicitly present in input map.
 *
 * @param params - Validation parameters including the schema name, input map, schema map, Zod context, and passthrough flag.
 * @returns A new Map containing only the declared keys (and/or unknown keys if `passthroughMode`) with validated and/or original values.
 */
export const validateAndCollectKnownEntries = ({
  target,
  inputMap,
  schemaMap,
  ctx,
  passthroughMode = false,
}: ValidateAndCollectKnownEntriesParams): Map<string | number, unknown> => {
  const outputMap = new Map<string | number, unknown>();

  for (const [key, value] of inputMap.entries()) {
    const typedKey = key as string | number;
    const valueSchema = schemaMap.get(typedKey);

    if (valueSchema) {
      const result = valueSchema.safeParse(value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const path = [typedKey, ...issue.path];
          ctx.addIssue({
            ...issue,
            path,
            message: containerInvalidValueMessage({
              target,
              path,
              originalMessage: issue.message,
            }),
          });
        }
      } else {
        if (result.data !== undefined || inputMap.has(typedKey)) {
          outputMap.set(typedKey, result.data);
        }
      }
    } else if (passthroughMode) {
      outputMap.set(typedKey, value);
    }
  }

  return outputMap;
};

type CreateStrictMapSchemaParams<T extends StrictMapEntries> = {
  target: string;
  entries: T;
  unknownKeys?: UnknownKeysMode;
};

/**
 * Creates a Zod schema for validating and returning a StrictMap structure from a Map input.
 *
 * This utility helps enforce a well-defined set of keys, value types, and structural integrity
 * for Maps, especially when dealing with decoded CBOR data or API responses using Map structures.
 *
 * Features:
 * - Asserts the input is a Map (with user-friendly type error messages).
 * - Each key's presence and value type is checked per the provided `entries`.
 * - Ensures all required keys are present, and optionally enforces or strips unknown keys.
 * - All validation errors are prefixed with the target schema name for better debugging.
 * - Returned Maps are strongly typed by the input schema (`StrictMap<T>`).
 *
 * @template T Array of `[key, schema]` tuples ("entries"), usually written with `as const`.
 * @param target String name to identify the schema in error messages (e.g., `'DeviceAuth'`).
 * @param entries Array of `[key, z.ZodType]` for all allowed keys (and their schemas); must be `as const`.
 * @param unknownKeys How to handle keys not listed in `entries`:
 *   - 'strip' (default): remove unknown keys from output.
 *   - 'passthrough': allow unknown keys in output, unvalidated.
 *   - 'strict': error on unknown keys.
 *
 * @returns A `z.ZodType` that parses a Map to a `StrictMap<T>`.
 *
 * @example
 * // Enforce three fields, error on extraneous keys (default)
 * const entries = [
 *   ['id', z.number()],
 *   ['name', z.string()],
 *   ['enabled', z.boolean()],
 * ] as const;
 * const mapSchema = createStrictMapSchema({ target: 'User', entries });
 * mapSchema.parse(new Map([['id', 1], ['name', 'x'], ['enabled', true]])); // OK
 *
 * @example
 * // Strip unknown keys
 * const mapSchema = createStrictMapSchema({ target: 'User', entries, unknownKeys: 'strip' });
 * mapSchema.parse(new Map([['id', 2], ['name', 'y'], ['foo', 9]])); // unknown 'foo' dropped
 *
 * @example
 * // Passthrough: include unknown keys
 * const mapSchema = createStrictMapSchema({ target: 'User', entries, unknownKeys: 'passthrough' });
 * mapSchema.parse(new Map([['id', 3], ['name', 'z'], ['unknown', 123]])); // 'unknown' stays
 *
 * @example
 * // CBOR decoded header (with integer keys)
 * const protectedHeaderSchema = createStrictMapSchema({
 *   target: 'ProtectedHeaders',
 *   entries: [
 *     [1, z.number()], // Algorithm
 *     [4, z.string()], // Key ID
 *   ] as const,
 * });
 * const decoded = decodeCbor(encoded); // Map from CBOR
 * protectedHeaderSchema.parse(decoded); // validated StrictMap
 */
export const createStrictMapSchema = <T extends StrictMapEntries>({
  target,
  entries,
  unknownKeys = 'strip',
}: CreateStrictMapSchemaParams<T>): z.ZodType<
  StrictMap<T>,
  z.ZodTypeDef,
  Map<unknown, unknown>
> => {
  const { schemaMap, requiredKeys, allKeys } = buildEntriesIndex(entries);

  // Transform to validate and build output map
  return z.any().transform((input, ctx) => {
    if (!(input instanceof Map)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerInvalidTypeMessage({
          target,
          expected: 'Map',
          received: getTypeName(input),
        }),
        path: [],
      });
      return z.NEVER;
    }

    const inputMap = input as Map<unknown, unknown>;

    // Validate required keys
    const missingKeys = [...requiredKeys].filter((key) => !inputMap.has(key));
    if (missingKeys.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: strictMapMissingKeysMessage(target, missingKeys),
        path: [],
      });
      return z.NEVER;
    }

    // Validate unexpected keys in strict mode
    if (unknownKeys === 'strict') {
      const unexpectedKeys = [...inputMap.keys()].filter(
        (key) => !allKeys.has(key as string | number)
      ) as (string | number)[];
      if (unexpectedKeys.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: strictMapUnexpectedKeysMessage(target, unexpectedKeys),
          path: [],
        });
        return z.NEVER;
      }
    }

    const outputMap = validateAndCollectKnownEntries({
      target,
      inputMap,
      schemaMap,
      ctx,
      passthroughMode: false,
    });

    return outputMap as unknown as StrictMap<T>;
  }) as unknown as z.ZodType<StrictMap<T>, z.ZodTypeDef, Map<unknown, unknown>>;
};
