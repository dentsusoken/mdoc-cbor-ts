import { z } from 'zod';
import { digestSchema } from './Digest';
import { digestIDSchema } from './DigestID';

export const DIGEST_IDS_NON_EMPTY_MESSAGE =
  'DigestIDs: Please provide at least one {DigestID => Digest} entry';

/**
 * Schema for digest IDs in MSO
 * @description
 * Represents a record of digest IDs and their corresponding digest values.
 * This schema validates that each digest ID maps to a valid digest.
 *
 * ```cddl
 * DigestIDs = {+ DigestID => Digest}
 * ```
 *
 * @example
 * ```typescript
 * const digests = new Map<number, Uint8Array>([
 *   [1, new Uint8Array([0xde, 0xad, 0xbe, 0xef])],
 * ]);
 * const result = digestIDsSchema.parse(digests); // Returns DigestIDs (Map)
 * ```
 */
export const digestIDsSchema = z
  .map(digestIDSchema, digestSchema)
  .refine((data) => data.size > 0, { message: DIGEST_IDS_NON_EMPTY_MESSAGE });

/**
 * Type definition for digest IDs
 * @description
 * Represents a validated record of digest IDs and their digest values
 *
 * @see digestIDSchema
 * @see digestSchema
 */
export type DigestIDs = z.output<typeof digestIDsSchema>;
