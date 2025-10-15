import { z } from 'zod';
import type { StrictMap, StrictMapEntries } from '@/strict-map/types';

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
 * Creates an error message when input is not a Map
 * @param target - The name of the target schema being validated
 * @param actualType - The actual type of the input (optional)
 * @returns A formatted error message string
 */
export const strictMapNotMapMessage = (
  target: string,
  actualType?: string
): string =>
  actualType
    ? `${target}: Must be a Map, received ${actualType}`
    : `${target}: Must be a Map`;

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

/**
 * Creates an error message for a specific key's value validation failure within a StrictMap.
 *
 * @param target - The name of the target schema being validated (e.g., "ValidityInfo").
 * @param path - An array representing the path to the nested key(s) that failed validation,
 *     where each element is a key string (e.g., ['validFrom'] or for nested: ['prop1', 'subfield']).
 * @param originalMessage - The original Zod error message produced by the key's schema.
 * @returns A formatted error message string, prefixed with the target and path.
 *
 * @example
 * // Given:
 * //   target = "ValidityInfo"
 * //   path = ["validFrom"]
 * //   originalMessage = "ValidFrom: Expected date string"
 * //
 * // Returns: "ValidityInfo.validFrom: Expected date string" (duplication avoided)
 */
export const strictMapKeyValueMessage = (
  target: string,
  path: (string | number)[],
  originalMessage: string
): string => {
  const label = [target, ...path].join('.');

  const colonIndex = originalMessage.indexOf(':');
  if (colonIndex === -1) {
    return `${label}: ${originalMessage}`;
  }

  // Check if the original message already contains the full path to avoid duplication
  const originalPrefix = originalMessage.substring(0, colonIndex).trim();

  // If the original message already contains the full path, just use the message part
  if (originalPrefix === label) {
    const messagePart = originalMessage.substring(colonIndex + 1).trim();
    return `${label}: ${messagePart}`;
  }

  // If the original message already contains a path that ends with our current path,
  // extract just the message part to avoid duplication
  const pathSuffix = path[path.length - 1];
  if (
    originalPrefix.endsWith(`.${pathSuffix}`) ||
    originalPrefix === String(pathSuffix)
  ) {
    const messagePart = originalMessage.substring(colonIndex + 1).trim();
    return `${label}: ${messagePart}`;
  }

  // Otherwise, keep the full original message
  return `${label}: ${originalMessage}`;
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
  // Create a record of key -> schema for efficient lookup
  const schemaMap = new Map<string | number, z.ZodType>();
  const requiredKeys = new Set<string | number>();
  const allKeys = new Set<string | number>();

  for (const [key, schema] of entries) {
    schemaMap.set(key, schema);
    allKeys.add(key);

    // Check if the schema is optional
    if (!schema.isOptional()) {
      requiredKeys.add(key);
    }
  }

  // Create base schema with custom Map validation that includes actual type
  const schema: z.ZodTypeAny = z.any().refine(
    (input) => input instanceof Map,
    (input) => {
      const actualType =
        typeof input === 'object' && input !== null
          ? input.constructor.name
          : typeof input;
      return {
        message: strictMapNotMapMessage(target, actualType),
      };
    }
  );

  // Required and unknown key validations are performed in transform to avoid
  // chaining additional refines that may execute during internal probes.

  // Transform to validate and build output map
  return schema.transform(
    (map: Map<unknown, unknown>, ctx: z.RefinementCtx) => {
      // Ensure map is valid before processing; prior refine handles errors
      if (!map || !(map instanceof Map)) {
        return map as unknown as Map<string | number, unknown>;
      }

      // Validate required keys
      const missingKeys = [...requiredKeys].filter((key) => !map.has(key));
      if (missingKeys.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: strictMapMissingKeysMessage(target, missingKeys),
          path: [],
        });
      }

      // Validate unexpected keys in strict mode
      if (unknownKeys === 'strict') {
        const unexpectedKeys = [...map.keys()].filter(
          (key) => !allKeys.has(key as string | number)
        ) as (string | number)[];
        if (unexpectedKeys.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: strictMapUnexpectedKeysMessage(target, unexpectedKeys),
            path: [],
          });
        }
      }

      const outputMap = new Map<string | number, unknown>();

      // Validate and add known keys
      for (const [key, value] of map.entries()) {
        const typedKey = key as string | number;
        const keySchema = schemaMap.get(typedKey);

        if (keySchema) {
          // Known key - validate with schema
          const result = keySchema.safeParse(value);
          if (!result.success) {
            for (const issue of result.error.issues) {
              const path = [String(typedKey), ...issue.path];
              ctx.addIssue({
                ...issue,
                path,
                message: issue.message
                  ? strictMapKeyValueMessage(target, path, issue.message)
                  : undefined,
              });
            }
          } else {
            // Only add if parsed value is not undefined or key was present
            if (result.data !== undefined || map.has(typedKey)) {
              outputMap.set(typedKey, result.data);
            }
          }
        }
        // In strip mode, unknown keys are simply ignored
      }

      return outputMap;
    }
  ) as z.ZodType<StrictMap<T>, z.ZodTypeDef, Map<unknown, unknown>>;
};
