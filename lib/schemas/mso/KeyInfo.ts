import { z } from 'zod';
import { Entry } from '../common';

/**
 * Schema for key information in MSO
 * @description
 * Represents a record of key information with integer keys and arbitrary values.
 * This schema validates that the key information is a valid record structure.
 *
 * @example
 * ```typescript
 * const info = {
 *   "1": "value1",
 *   "-1": 123
 * };
 * const result = keyInfoSchema.parse(info); // Returns KeyInfo
 * ```
 */
export const keyInfoSchema = z.record(
  z.union([
    z.number().int(),
    z
      .string()
      .regex(/^-?\d+$/)
      .transform((s) => Number(s)),
  ]),
  z.any()
);

/**
 * Type definition for key information
 * @description
 * Represents a validated key information structure
 *
 * ```cddl
 * KeyInfo = {* int => any}
 * ```
 */
export type KeyInfo = z.infer<typeof keyInfoSchema>;

/**
 * Type definition for key information entries
 * @description
 * Represents a key-value pair from the key information record
 */
export type KeyInfoEntry = Entry<KeyInfo>;
