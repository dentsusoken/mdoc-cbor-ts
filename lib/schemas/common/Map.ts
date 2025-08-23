import { z } from 'zod';
import { createRequiredSchema } from './Required';

/**
 * Creates an error message for invalid Map types
 * @description
 * Generates a standardized error message when a Map validation fails due to invalid type.
 * The message indicates the expected target name and that the value should be a Map.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = mapInvalidTypeMessage('DeviceNameSpaces');
 * // Returns: "DeviceNameSpaces: Expected a map, but received a different type. Please provide a map."
 * ```
 */
export const mapInvalidTypeMessage = (target: string): string =>
  `${target}: Expected a map, but received a different type. Please provide a map.`;

/**
 * Creates an error message for empty Map validation
 * @description
 * Generates a standardized error message when a Map validation fails because
 * the map is empty but non-empty maps are required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = mapEmptyMessage('DeviceNameSpaces');
 * // Returns: "DeviceNameSpaces: At least one entry must be provided. The map cannot be empty."
 * ```
 */
export const mapEmptyMessage = (target: string): string =>
  `${target}: At least one entry must be provided. The map cannot be empty.`;

type MapSchemaParams<K, V> = {
  target: string;
  keySchema: z.ZodType<K>;
  valueSchema: z.ZodType<V>;
  allowEmpty?: boolean;
};

const createMapInnerSchema = <K, V>({
  target,
  keySchema,
  valueSchema,
  allowEmpty = false,
}: MapSchemaParams<K, V>): z.ZodType<Map<K, V>> =>
  z
    .map(keySchema, valueSchema, {
      invalid_type_error: mapInvalidTypeMessage(target),
    })
    .refine(
      (data) => {
        return allowEmpty || data.size > 0;
      },
      {
        message: mapEmptyMessage(target),
      }
    );

/**
 * Builds a map schema with optional non-empty enforcement.
 * @description
 * Returns a Zod schema that validates a required Map<K, V> structure, where each
 * key and value is validated by the provided schemas. By default, the map must be
 * non-empty; set `allowEmpty: true` to allow empty maps. All validation error
 * messages are prefixed with the provided `target` and use the message constants
 * exported from this module.
 *
 * Validation rules:
 * - Requires a Map type with a target-prefixed invalid type message
 * - Requires presence with a target-prefixed required message
 * - Enforces non-empty by default; pass `allowEmpty: true` to allow empty Map
 * - Each key must satisfy the provided `keySchema`
 * - Each value must satisfy the provided `valueSchema`
 *
 * ```cddl
 * Map = { * any => any }
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "DeviceNameSpaces", "Headers")
 * @param keySchema - Zod schema for validating map keys
 * @param valueSchema - Zod schema for validating map values
 * @param allowEmpty - When true, allows an empty map (default: false)
 * @returns A Zod schema that validates Map<K, V> structures
 *
 * @example
 * ```typescript
 * const nameSpacesSchema = createMapSchema({
 *   target: 'DeviceNameSpaces',
 *   keySchema: z.string(),
 *   valueSchema: z.any(),
 * });
 * const result = nameSpacesSchema.parse(new Map([['key', 'value']])); // Map<string, any>
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty map is not allowed)
 * // Message: "Headers: At least one entry must be provided. The map cannot be empty."
 * const schema = createMapSchema({
 *   target: 'Headers',
 *   keySchema: z.number(),
 *   valueSchema: z.string(),
 * });
 * schema.parse(new Map());
 * ```
 *
 * @example
 * ```typescript
 * // Allows empty map with allowEmpty
 * const schema = createMapSchema({
 *   target: 'Headers',
 *   keySchema: z.number(),
 *   valueSchema: z.string(),
 *   allowEmpty: true,
 * });
 * const result = schema.parse(new Map()); // Map<number, string>
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: "Headers: Expected a map, but received a different type. Please provide a map."
 * const schema = createMapSchema({
 *   target: 'Headers',
 *   keySchema: z.number(),
 *   valueSchema: z.string(),
 * });
 * // @ts-expect-error
 * schema.parse({ key: 'value' }); // Object instead of Map
 * ```
 */
export const createMapSchema = <K, V>({
  target,
  keySchema,
  valueSchema,
  allowEmpty = false,
}: MapSchemaParams<K, V>): z.ZodType<Map<K, V>> =>
  createRequiredSchema(target).pipe(
    createMapInnerSchema({ target, keySchema, valueSchema, allowEmpty })
  );
