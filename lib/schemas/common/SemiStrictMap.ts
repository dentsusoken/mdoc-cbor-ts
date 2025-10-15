import { z } from 'zod';
import type { SemiStrictMap, StrictMapEntries } from '@/strict-map/types';

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
 * Creates an error message for a specific key's value validation failure within a SemiStrictMap.
 *
 * @param target - The name of the target schema being validated (e.g., "UserData").
 * @param path - An array representing the path to the nested key(s) that failed validation,
 *     where each element is a key string (e.g., ['age'] or for nested: ['user', 'age']).
 * @param originalMessage - The original Zod error message produced by the key's schema.
 * @returns A formatted error message string, prefixed with the target and path.
 *
 * @example
 * // Given:
 * //   target = "UserData"
 * //   path = ["age"]
 * //   originalMessage = "age: Expected number, received string"
 * //
 * // Returns: "UserData.age: Expected number, received string" (duplication avoided)
 */
export const semiStrictMapKeyValueMessage = (
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

type CreateSemiStrictMapSchemaParams<T extends StrictMapEntries> = {
  target: string;
  entries: T;
};

/**
 * Creates a Zod schema for validating and returning a SemiStrictMap structure from a Map input.
 *
 * This utility helps enforce a well-defined set of keys and value types for Maps while allowing
 * additional unknown keys to pass through, especially useful when dealing with decoded CBOR data
 * or API responses using Map structures where some keys may be optional or unknown.
 *
 * Features:
 * - Asserts the input is a Map (with user-friendly type error messages).
 * - Each key's presence and value type is checked per the provided `entries`.
 * - Ensures all required keys are present.
 * - Unknown keys are always included in the output (passthrough behavior).
 * - All validation errors are prefixed with the target schema name for better debugging.
 * - Returned Maps are strongly typed by the input schema (`SemiStrictMap<T, U>`).
 *
 * @template T Array of `[key, schema]` tuples ("entries"), usually written with `as const`.
 * @template U Type constraint for additional allowed keys (defaults to `string | number`).
 * @param target String name to identify the schema in error messages (e.g., `'UserData'`).
 * @param entries Array of `[key, z.ZodType]` for all allowed keys (and their schemas); must be `as const`.
 *
 * @returns A `z.ZodType` that parses a Map to a `SemiStrictMap<T, U>`.
 *
 * @example
 * // Basic usage with required fields
 * const entries = [
 *   ['id', z.number()],
 *   ['name', z.string()],
 * ] as const;
 * const mapSchema = createSemiStrictMapSchema({ target: 'User', entries });
 * mapSchema.parse(new Map([['id', 1], ['name', 'Alice'], ['extra', 'value']])); // OK, 'extra' included
 *
 * @example
 * // With optional fields
 * const entries = [
 *   ['required', z.string()],
 *   ['optional', z.number().optional()],
 * ] as const;
 * const mapSchema = createSemiStrictMapSchema({ target: 'Config', entries });
 * mapSchema.parse(new Map([['required', 'value'], ['unknown', 123]])); // OK, both included
 */
export const createSemiStrictMapSchema = <
  T extends StrictMapEntries,
  U extends string | number = string | number,
>({
  target,
  entries,
}: CreateSemiStrictMapSchemaParams<T>): z.ZodType<
  SemiStrictMap<T, U>,
  z.ZodTypeDef,
  Map<unknown, unknown>
> => {
  // Build schema map and track required keys
  const schemaMap = new Map<string | number, z.ZodType>();
  const requiredKeys = new Set<string | number>();
  const allKeys = new Set<string | number>();

  for (const [key, schema] of entries as unknown as readonly [
    string | number,
    z.ZodType,
  ][]) {
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
              const path = [String(typedKey), ...issue.path];
              const message = issue.message || 'Invalid value';
              ctx.addIssue({
                ...issue,
                path,
                message: semiStrictMapKeyValueMessage(target, path, message),
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
