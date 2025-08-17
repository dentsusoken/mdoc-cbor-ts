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
 * Builds a Map schema with typed keys and values.
 * @description
 * Returns a Zod schema that validates a required `Map<K, V>` where each key and
 * value is validated against the provided `keySchema` and `valueSchema`.
 * Error messages are prefixed with the provided `target` and use the suffix
 * constants from this module.
 *
 * Validation rules:
 * - Requires a Map type with a target-prefixed invalid type message
 * - Requires presence with a target-prefixed required message
 * - Enforces non-empty by default; pass `allowEmpty: true` to allow empty Map
 *
 * @example
 * ```typescript
 * const schema = createMapSchema({
 *   target: 'DeviceNameSpaces',
 *   keySchema: z.string(),
 *   valueSchema: z.any(),
 *   allowEmpty: false,
 * });
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
