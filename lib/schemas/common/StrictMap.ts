import { z } from 'zod';
import type { StrictMap, StrictMapEntries } from './strict-map/types';

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
 * Creates an error message for a specific key's value validation failure
 * @param target - The name of the target schema being validated
 * @param key - The key that failed validation
 * @param originalMessage - The original Zod error message
 * @returns A formatted error message string
 */
export const strictMapKeyValueMessage = (
  target: string,
  key: string | number,
  originalMessage: string
): string => {
  const colonIndex = originalMessage.indexOf(':');
  if (colonIndex === -1) {
    return `${target}.${key}: ${originalMessage}`;
  }

  const keyPart = originalMessage.substring(0, colonIndex).trim();
  const messagePart = originalMessage.substring(colonIndex + 1).trim();
  // Preserve the full nested path after the first segment to retain hierarchy
  const firstDotIndex = keyPart.indexOf('.');
  const nestedPath =
    firstDotIndex !== -1 ? keyPart.substring(firstDotIndex + 1) : keyPart;
  return `${target}.${key}.${nestedPath}: ${messagePart}`;
};

/**
 * Creates a Zod schema that validates and returns a StrictMap
 * @description
 * This function creates a Zod schema that:
 * - Validates that the input is a Map
 * - Validates each key-value pair according to the provided entries schema
 * - Returns a type-safe StrictMap on successful validation
 * - Includes target name in all error messages for better debugging
 * - Handles unknown keys based on the unknownKeys mode
 *
 * This is particularly useful when:
 * - Decoding CBOR data that should be a StrictMap
 * - Validating API responses containing Maps
 * - Ensuring runtime type safety for Map structures
 *
 * @template T - The entries array type (must be `as const`)
 * @param target - Name used in error messages (e.g., "DeviceAuth", "ProtectedHeaders")
 * @param entries - Array of [key, schema] tuples defining the expected map structure
 * @param unknownKeys - How to handle keys not defined in entries (default: 'strict')
 *   - 'strip': Remove unknown keys from output (safe, recommended for most cases)
 *   - 'passthrough': Include unknown keys in output (use with caution)
 *   - 'strict': Throw error if unknown keys are present (default, most strict)
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { createStrictMapSchema } from './createStrictMapSchema';
 *
 * const entries = [
 *   ['name', z.string()],
 *   ['age', z.number()],
 *   ['active', z.boolean()],
 * ] as const;
 *
 * // Default (strict mode): extra keys cause an error
 * const schema1 = createStrictMapSchema('Person', entries);
 *
 * const validMap = new Map([
 *   ['name', 'Alice'],
 *   ['age', 25],
 *   ['active', true],
 * ]);
 * const result = schema1.parse(validMap); // StrictMap<typeof entries>
 *
 * // With extra key - throws error in strict mode
 * const invalidMap = new Map([
 *   ['name', 'Alice'],
 *   ['age', 25],
 *   ['active', true],
 *   ['extra', 'value'],
 * ]);
 * schema1.parse(invalidMap); // Throws: "Person: Unexpected keys: extra"
 * ```
 *
 * @example
 * ```typescript
 * // Strip mode: extra keys are removed (safe, recommended)
 * const schema2 = createStrictMapSchema('Person', entries, 'strip');
 *
 * const result2 = schema2.parse(new Map([
 *   ['name', 'Alice'],
 *   ['age', 25],
 *   ['active', true],
 *   ['extra', 'removed'],
 * ]));
 * // result2: Map { 'name' => 'Alice', 'age' => 25, 'active' => true }
 * // 'extra' key is removed
 * ```
 *
 * @example
 * ```typescript
 * // Passthrough mode: extra keys are included (use with caution)
 * const schema3 = createStrictMapSchema('Person', entries, 'passthrough');
 *
 * const result3 = schema3.parse(new Map([
 *   ['name', 'Alice'],
 *   ['age', 25],
 *   ['active', true],
 *   ['extra', 'kept'],
 * ]));
 * // result3: Map { 'name' => 'Alice', 'age' => 25, 'active' => true, 'extra' => 'kept' }
 * ```
 *
 * @example
 * ```typescript
 * // With CBOR decoding
 * import { decodeCbor } from '../../../cbor/codec';
 *
 * const entries = [
 *   [1, z.number()],  // Algorithm
 *   [4, z.string()],  // Key ID
 * ] as const;
 *
 * const headerSchema = createStrictMapSchema('ProtectedHeaders', entries);
 *
 * const encoded = encodeCbor(new Map([[1, -7], [4, 'key-123']]));
 * const decoded = decodeCbor(encoded); // Returns a Map
 * const validated = headerSchema.parse(decoded); // StrictMap with type safety
 * ```
 */
export const createStrictMapSchema = <T extends StrictMapEntries>(
  target: string,
  entries: T,
  unknownKeys: UnknownKeysMode = 'strip'
): z.ZodType<StrictMap<T>, z.ZodTypeDef, Map<unknown, unknown>> => {
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
              ctx.addIssue({
                ...issue,
                path: [String(typedKey), ...issue.path],
                message: issue.message
                  ? strictMapKeyValueMessage(target, typedKey, issue.message)
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
