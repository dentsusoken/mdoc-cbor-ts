import { z } from 'zod';
import { bytesSchema } from '../common';

/**
 * Schema for digest in MSO
 * @description
 * Represents a binary string containing a digest value.
 * This schema validates that the digest is a valid binary string.
 *
 * @example
 * ```typescript
 * const digest = Buffer.from([]);
 * const result = digestSchema.parse(digest); // Returns Digest
 * ```
 */
export const digestSchema = bytesSchema;

/**
 * Type definition for digest
 * @description
 * Represents a validated binary string containing a digest value
 *
 * ```cddl
 * Digest = bstr
 * ```
 */
export type Digest = z.infer<typeof digestSchema>;
