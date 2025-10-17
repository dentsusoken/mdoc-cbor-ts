import { z } from 'zod';
import { createBytesSchema } from '../cbor/Bytes';

/**
 * Schema for digest in MSO
 * @description
 * Validates a required binary value (`bstr`) for a digest. Accepts `Uint8Array`
 * or `Buffer` as input and produces a `Uint8Array`. Error messages are
 * prefixed with `Digest: ...`.
 *
 * ```cddl
 * Digest = bstr
 * ```
 *
 * @example
 * ```typescript
 * const digest = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
 * const result = digestSchema.parse(digest); // Uint8Array
 * ```
 *
 * @example
 * ```typescript
 * const digestFromBuffer = Buffer.from([0xde, 0xad, 0xbe, 0xef]);
 * const result = digestSchema.parse(digestFromBuffer); // Uint8Array
 * ```
 *
 * @see createBytesSchema
 */
export const digestSchema = createBytesSchema('Digest');

/**
 * Type definition for digest
 * @description
 * Represents a validated binary string containing a digest value
 *
 */
export type Digest = z.output<typeof digestSchema>;
