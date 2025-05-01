import { z } from 'zod';
import { Digest, digestSchema } from './Digest';
import { DigestID, digestIDSchema } from './DigestID';

/**
 * Schema for digest IDs in MSO
 * @description
 * Represents a record of digest IDs and their corresponding digest values.
 * This schema validates that each digest ID maps to a valid digest.
 *
 * @example
 * ```typescript
 * const digests = {
 *   1: Buffer.from('0123456789abcdef')
 * };
 * const result = digestIDsSchema.parse(digests); // Returns DigestIDs
 * ```
 */
export const digestIDsSchema = z
  .map(digestIDSchema, digestSchema)
  .refine((data) => data.size > 0)
  .transform((data) => Object.fromEntries(data));

/**
 * Type definition for digest IDs
 * @description
 * Represents a validated record of digest IDs and their digest values
 *
 * ```cddl
 * DigestIDs = {+ DigestID => Digest}
 * ```
 * @see {@link DigestID}
 * @see {@link Digest}
 */
export type DigestIDs = z.infer<typeof digestIDsSchema>;
