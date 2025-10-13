import { z } from 'zod';
import type { SemiStrictMap, StrictMapEntries } from './types';

/**
 * Creates an error message when input is not a Map
 * @param target - The name of the target schema being validated
 * @param actualType - The actual type of the input (optional)
 * @returns A formatted error message string
 */
export const semiStrictMapNotMapMessage = (
  target: string,
  actualType: string
): string => `${target}: Must be a Map, received ${actualType}`;

/**
 * Creates an error message when required keys are missing
 * @param target - The name of the target schema being validated
 * @param keys - Array of missing key names
 * @returns A formatted error message string
 */
export const semiStrictMapMissingKeysMessage = (
  target: string,
  keys: (string | number)[]
): string => `${target}: Missing required keys: ${keys.join(', ')}`;

/**
 * Creates an error message for a specific key's value validation failure
 * @param target - The name of the target schema being validated
 * @param key - The key that failed validation
 * @param originalMessage - The original Zod error message
 * @returns A formatted error message string
 */
export const semiStrictMapKeyValueMessage = (
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
 * Creates a Zod schema that validates and returns a SemiStrictMap
 * @description
 * This function creates a Zod schema that:
 * - Validates that the input is a Map instance
 * - Validates required keys are present
 * - Validates known keys have correct value types
 * - Handles unknown keys according to the specified mode
 * - Returns a SemiStrictMap with type-safe operations
 *
 * @template T - The entries array type (must be `as const`)
 * @template U - The type constraint for additional allowed keys
 * @param target - The name of the target schema for error messages
 * @param entries - Array of [key, schema] tuples defining the map structure
 * @param unknownKeys - How to handle unknown keys (always 'passthrough' for SemiStrictMap)
 *
 * @example
 * ```typescript
 * const entries = [
 *   ['name', z.string()],
 *   ['age', z.number()],
 * ] as const;
 *
 * const schema = createSemiStrictMapSchema('User', entries);
 * const result = schema.parse(userMap); // SemiStrictMap<typeof entries, string | number>
 * ```
 */
export const createSemiStrictMapSchema = <
  T extends StrictMapEntries,
  U extends string | number = string | number,
>(
  target: string,
  entries: T
): z.ZodType<SemiStrictMap<T, U>, z.ZodTypeDef, Map<unknown, unknown>> => {
  // Build schema map and track required keys
  const schemaMap = new Map<string | number, z.ZodType>();
  const requiredKeys = new Set<string | number>();
  const allKeys = new Set<string | number>();

  for (const [key, schema] of entries) {
    schemaMap.set(key, schema);
    allKeys.add(key);
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
        message: semiStrictMapNotMapMessage(target, actualType),
      };
    }
  );

  // Transform to validate and build output map
  return schema.transform(
    (map: Map<unknown, unknown>, ctx: z.RefinementCtx) => {
      // Safety guard: if the input isn't a Map, the prior refine already added an error.
      // Avoid accessing Map methods on invalid inputs during internal probes.
      if (!(map instanceof Map)) {
        return map as unknown as Map<string | number, unknown>;
      }

      // Validate required keys presence here to avoid chaining another refine.
      const missingKeys = [...requiredKeys].filter((key) => !map.has(key));
      if (missingKeys.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: semiStrictMapMissingKeysMessage(target, missingKeys),
          path: [],
        });
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
                  ? semiStrictMapKeyValueMessage(
                      target,
                      typedKey,
                      issue.message
                    )
                  : semiStrictMapKeyValueMessage(
                      target,
                      typedKey,
                      'Invalid value'
                    ),
              });
            }
          } else {
            // Only add if parsed value is not undefined or key was present
            if (result.data !== undefined || map.has(typedKey)) {
              outputMap.set(typedKey, result.data);
            }
          }
        } else {
          // Unknown key - always include as-is for SemiStrictMap
          outputMap.set(typedKey, value);
        }
      }

      return outputMap;
    }
  ) as z.ZodType<SemiStrictMap<T, U>, z.ZodTypeDef, Map<unknown, unknown>>;
};
