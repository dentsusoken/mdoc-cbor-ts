import { z } from 'zod';
import type { SemiStrictMap, StrictMapEntries } from '@/strict-map/types';
import {
  buildEntriesIndex,
  strictMapMissingKeysMessage,
  strictMapNotMapMessage,
  validateAndCollectKnownEntries,
} from './StrictMap';
import { getTypeName } from '@/utils/getTypeName';

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
  const { schemaMap, requiredKeys } = buildEntriesIndex(entries);

  // Transform to validate and build output map
  return z.any().transform((input: unknown, ctx: z.RefinementCtx) => {
    if (!(input instanceof Map)) {
      const actualType = getTypeName(input);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: strictMapNotMapMessage(target, actualType),
        path: [],
      });
      return z.NEVER;
    }

    const inputMap = input as Map<unknown, unknown>;

    // Validate required keys presence here to avoid chaining another refine.
    const missingKeys = [...requiredKeys].filter((key) => !inputMap.has(key));
    if (missingKeys.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: strictMapMissingKeysMessage(target, missingKeys),
        path: [],
      });
      return z.NEVER;
    }

    return validateAndCollectKnownEntries({
      target,
      inputMap,
      schemaMap,
      ctx,
      passthroughMode: true,
    });
  }) as z.ZodType<SemiStrictMap<T, U>, z.ZodTypeDef, Map<unknown, unknown>>;
};
