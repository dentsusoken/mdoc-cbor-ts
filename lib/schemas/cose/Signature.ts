import { createBytesSchema } from '@/schemas/common/Bytes';

/**
 * Schema for COSE signature
 * @description
 * Represents COSE signature as a byte string containing the cryptographic signature.
 * The signature provides integrity protection and authentication for the COSE structure.
 *
 * ```cddl
 * signature = bstr
 * ```
 *
 * @example
 * ```typescript
 * const signature = new Uint8Array([0x12, 0x34, 0x56, 0x78]); // Cryptographic signature
 * const result = signatureSchema.parse(signature); // Returns Uint8Array
 * ```
 */
export const signatureSchema = createBytesSchema('Signature');
