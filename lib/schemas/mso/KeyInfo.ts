import { z } from 'zod';
import { labelSchema } from '@/schemas/cose/Label';
import { createMapSchema } from '@/schemas/containers/Map';

/**
 * Zod schema for key information attached to an MSO device key.
 *
 * @description
 * This schema validates a `Map` where each key is a valid COSE label—either a non-empty string or an integer—and each value can be of any type. The primary use is to express optional extra information or metadata about a device key, with flexible arbitrary entries.
 *
 * Validation details:
 * - The container must be a `Map` type, otherwise a `KeyInfo: ...`-prefixed error is thrown.
 * - Empty Maps are permitted and valid.
 * - Each key is checked using {@link labelSchema}, accepting only non-empty strings or integers. If a key fails, a `Label: ...` error is raised.
 * - Each value can be any data (no restrictions).
 *
 * CDDL:
 * ```cddl
 * KeyInfo = {* label => any}
 * label = int / tstr
 * ```
 *
 * @example
 * ```typescript
 * // Valid example: integer and string labels
 * const info = new Map<number | string, unknown>([
 *   [1, 'value1'],
 *   ['customLabel', true],
 * ]);
 * const result = keyInfoSchema.parse(info); // Map(2) with keys 1 and 'customLabel'
 * ```
 *
 * @example
 * // Allows an empty Map
 * keyInfoSchema.parse(new Map()); // Map(0)
 *
 * @see labelSchema
 * @see createMapSchema
 */
export const keyInfoSchema = createMapSchema({
  target: 'KeyInfo',
  keySchema: labelSchema,
  valueSchema: z.unknown(),
});

/**
 * Type definition for key information
 * @description
 * Represents a validated key information structure.
 */
export type KeyInfo = z.output<typeof keyInfoSchema>;
