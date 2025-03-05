import { z } from 'zod';
import { NameSpace, nameSpaceSchema } from '../common';
import { DigestIDs, digestIDsSchema } from './DigestIDs';

/**
 * Schema for value digests in MSO
 * @description
 * Represents a record of namespaces and their corresponding digest IDs.
 * This schema validates that each namespace maps to valid digest IDs.
 *
 * @example
 * ```typescript
 * const digests = {
 *   "org.iso.18013.5.1": {
 *     0: Buffer.from('0123456789abcdef')
 *   }
 * };
 * const result = valueDigestsSchema.parse(digests); // Returns ValueDigests
 * ```
 */
export const valueDigestsSchema = z
  .record(nameSpaceSchema, digestIDsSchema)
  .refine((data) => {
    return Object.keys(data).length > 0;
  });

/**
 * Type definition for value digests
 * @description
 * Represents a validated record of namespaces and their digest IDs
 *
 * ```cddl
 * ValueDigests = {+ NameSpace => DigestIDs}
 * ```
 * @see {@link NameSpace}
 * @see {@link DigestIDs}
 */
export type ValueDigests = z.infer<typeof valueDigestsSchema>;
