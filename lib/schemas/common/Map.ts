import { z } from 'zod';

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
 * Creates an error message for required Map fields
 * @description
 * Generates a standardized error message when a required Map field is missing.
 * The message indicates the expected target name and that the field is required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = mapRequiredMessage('DeviceNameSpaces');
 * // Returns: "DeviceNameSpaces: This field is required. Please provide a map."
 * ```
 */
export const mapRequiredMessage = (target: string): string =>
  `${target}: This field is required. Please provide a map.`;

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

/**
 * Creates a schema for validating Map structures with typed keys and values
 * @description
 * Generates a Zod schema that validates Map<K, V> structures where each key and
 * value is validated against the provided schemas. Error messages are prefixed
 * with the target name for consistency across the codebase.
 *
 * Validation rules:
 * - Requires a Map type with target-prefixed invalid type message
 * - Requires presence with target-prefixed required message
 * - Enforces non-empty by default; pass `allowEmpty: true` to allow empty Map
 * - Each key must satisfy the provided `keySchema`
 * - Each value must satisfy the provided `valueSchema`
 *
 * @param target - The name of the target schema (used in error messages)
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
 * const result = nameSpacesSchema.parse(new Map([['key', 'value']])); // Returns Map<string, any>
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty map is not allowed)
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
 * const result = schema.parse(new Map()); // Returns Map<number, string>
 * ```
 */
export const createMapSchema = <K, V>({
  target,
  keySchema,
  valueSchema,
  allowEmpty = false,
}: MapSchemaParams<K, V>): z.ZodType<Map<K, V>> =>
  z
    .map(keySchema, valueSchema, {
      invalid_type_error: mapInvalidTypeMessage(target),
      required_error: mapRequiredMessage(target),
    })
    .refine(
      (data) => {
        return allowEmpty || data.size > 0;
      },
      {
        message: mapEmptyMessage(target),
      }
    );
// z
//   .map(z.any(), z.any(), {
//     invalid_type_error: mapInvalidTypeMessage(target),
//     required_error: mapRequiredMessage(target),
//   })
//   .refine(
//     (data) => {
//       return allowEmpty || data.size > 0;
//     },
//     {
//       message: mapEmptyMessage(target),
//     }
//   )
//   .pipe(z.map(keySchema, valueSchema));
