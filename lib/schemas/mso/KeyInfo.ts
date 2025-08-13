import { z } from 'zod';
import { createMapSchema } from '@/schemas/common/Map';
import { createIntSchema } from '@/schemas/common/Int';

/**
 * Schema for key information in MSO
 * @description
 * Validates a Map-like structure where each key is an integer and each value is arbitrary (`any`).
 * Error messages are prefixed with `KeyInfo: ...` for container-level issues and
 * `KeyInfo.Key: ...` for key validation issues.
 *
 * Validation rules:
 * - Requires a Map type with a target-prefixed invalid type message
 * - Allows empty Map (`allowEmpty: true`)
 * - Each key must satisfy `int` via `createIntSchema('KeyInfo.Key')`
 * - Each value can be any type (`z.any()`)
 *
 * ```cddl
 * KeyInfo = {* int => any}
 * ```
 *
 * @example
 * ```typescript
 * const info = new Map<number, unknown>([
 *   [1, 'value1'],
 *   [-1, 123],
 * ]);
 * const result = keyInfoSchema.parse(info); // KeyInfo
 * ```
 *
 * @example
 * ```typescript
 * // Allows empty Map
 * const empty = keyInfoSchema.parse(new Map()); // Map(0)
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid container type)
 * // keyInfoSchema.parse({ 1: 'value' });
 * ```
 *
 * @see createMapSchema
 * @see createIntSchema
 */
export const keyInfoSchema = createMapSchema({
  target: 'KeyInfo',
  keySchema: createIntSchema('KeyInfo.Key'),
  valueSchema: z.any(),
  allowEmpty: true,
});

/**
 * Type definition for key information
 * @description
 * Represents a validated key information structure.
 */
export type KeyInfo = z.output<typeof keyInfoSchema>;
