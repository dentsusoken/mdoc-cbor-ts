import { z } from 'zod';

export const MAP_INVALID_TYPE_MESSAGE_SUFFIX =
  'Expected a Map with keys and values. Please provide a valid Map.';

export const MAP_REQUIRED_MESSAGE_SUFFIX =
  'This field is required. Please provide a Map.';

export const MAP_EMPTY_MESSAGE_SUFFIX =
  'At least one entry must be provided. The Map cannot be empty.';

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
      invalid_type_error: `${target}: ${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      required_error: `${target}: ${MAP_REQUIRED_MESSAGE_SUFFIX}`,
    })
    .refine(
      (data) => {
        return allowEmpty || data.size > 0;
      },
      {
        message: `${target}: ${MAP_EMPTY_MESSAGE_SUFFIX}`,
      }
    );
