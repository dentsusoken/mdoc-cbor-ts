import { labelSchema } from './Label';
import { z } from 'zod';
import { createMapSchema } from '@/schemas/common/containers/Map';
import { createRequiredSchema } from '../common/Required';

/**
 * Creates a schema for COSE label-keyed map validation
 * @description
 * Returns a Zod schema that validates a Map where keys are COSE labels (integers or non-empty strings)
 * and values can be any type. This is commonly used for COSE structures that use label-based mappings.
 *
 * Validation rules:
 * - Requires a Map type with a target-prefixed invalid type message
 * - Each key must be a valid COSE label (integer or non-empty string)
 * - Each value can be any type (`unknown`)
 * - Optionally allows empty Maps based on the `allowEmpty` parameter
 *
 * ```cddl
 * LabelKeyMap = {* label => any}
 * label = int / tstr
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "COSEKey", "COSESign1")
 * @param allowEmpty - Whether to allow empty Maps (defaults to true)
 *
 * @example
 * ```typescript
 * const deviceKeyMapSchema = createLabelKeyMapSchema('DeviceKey', false);
 * const keyMap = new Map<number | string, unknown>([
 *   [1, 2], // kty
 *   ['alg', 'ES256'], // algorithm
 * ]);
 * const result = coseKeyMapSchema.parse(keyMap); // Map<number | string, unknown>
 * ```
 *
 * @example
 * ```typescript
 * // Allows empty Map by default
 * const emptyMapSchema = createLabelKeyMapSchema('EmptyMap');
 * const empty = emptyMapSchema.parse(new Map()); // Map(0)
 * ```
 *
 * @example
 * ```typescript
 * // Disallow empty Maps
 * const nonEmptyMapSchema = createLabelKeyMapSchema('NonEmptyMap', false); // allowEmpty = false
 * // This would throw ZodError for empty Map
 * const emptyMap = new Map<number | string, unknown>();
 * const result = nonEmptyMapSchema.parse(emptyMap); // Throws ZodError
 * ```
 */
export const createLabelKeyMapSchema = (
  target: string,
  allowEmpty = true
): z.ZodType<Map<number | string, unknown>> =>
  createMapSchema({
    target,
    keySchema: labelSchema,
    valueSchema: z.unknown(),
    nonempty: allowEmpty,
  });
