import { z } from 'zod';
import { bytesSchema } from '@/schemas/common/Bytes';

/**
 * Schema for digest in MSO
 * @description
 * Represents a binary string containing a digest value.
 * This schema validates that the digest is a valid binary string.
 *
 * ```cddl
 * Digest = bstr
 * ```
 *
 * @example
 * ```typescript
 * const digest = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
 * const result = digestSchema.parse(digest); // Returns Digest (Buffer)
 * ```
 */
export const digestSchema = bytesSchema;

/**
 * Type definition for digest
 * @description
 * Represents a validated binary string containing a digest value
 *
 */
export type Digest = z.output<typeof digestSchema>;
