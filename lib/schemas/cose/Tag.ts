import { createBytesSchema } from '@/schemas/cbor/Bytes';

/**
 * Schema for COSE tag
 * @description
 * Represents COSE tag as a byte string containing the authentication tag or signature.
 * The tag provides integrity protection and authentication for the COSE structure.
 *
 * ```cddl
 * tag = bstr
 * ```
 *
 * @example
 * ```typescript
 * const tag = new Uint8Array([0x12, 0x34, 0x56, 0x78]); // Authentication tag
 * const result = tagSchema.parse(tag); // Returns Uint8Array
 * ```
 */
export const tagSchema = createBytesSchema('Tag');
