import { z } from 'zod';
import { createLabelKeyMapSchema } from '@/schemas/cose/LabelKeyMap';

/**
 * Schema for key information in MSO
 * @description
 * Validates a Map where keys are COSE labels (integers or non-empty strings) and values are arbitrary.
 * Error messages are prefixed with `KeyInfo: ...` for container-level issues and
 * `Label: ...` for key validation issues.
 *
 * Validation rules:
 * - Requires a Map type with a target-prefixed invalid type message
 * - Allows empty Map (`allowEmpty: true`)
 * - Each key must be a valid COSE label (integer or non-empty string)
 * - Each value can be any type (`unknown`)
 *
 * ```cddl
 * KeyInfo = {* label => any}
 * label = int / tstr
 * ```
 *
 * @example
 * ```typescript
 * const info = new Map<number | string, unknown>([
 *   [1, 'value1'],
 *   ['custom', 123],
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
 * @see createLabelKeyMapSchema
 */
export const keyInfoSchema = createLabelKeyMapSchema('KeyInfo');

/**
 * Type definition for key information
 * @description
 * Represents a validated key information structure.
 */
export type KeyInfo = z.output<typeof keyInfoSchema>;
