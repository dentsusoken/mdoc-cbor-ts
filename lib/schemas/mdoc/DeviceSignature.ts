import { z } from 'zod';
import { createSign1Schema } from '@/schemas/cose/Sign1';

/**
 * Schema for device signature in mdoc
 * @description
 * Represents a COSE_Sign1 signature created by the device for mdoc authentication.
 * This schema validates COSE_Sign1 arrays and transforms them into Sign1 objects.
 * The device signature provides integrity protection and authentication for mdoc data.
 *
 * ```cddl
 * DeviceSignature = COSE_Sign1
 * ```
 *
 * @example
 * ```typescript
 * const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]); // CBOR-encoded {1: -7}
 * const unprotectedHeaders = new Map<number, unknown>([[4, new Uint8Array([1, 2, 3])]]);
 * const payload = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
 * const signature = new Uint8Array([0x12, 0x34, 0x56, 0x78]); // Cryptographic signature
 *
 * const sign1Array = [protectedHeaders, unprotectedHeaders, payload, signature];
 * const result = deviceSignatureSchema.parse(sign1Array); // Returns Sign1 instance
 * ```
 */
export const deviceSignatureSchema = createSign1Schema('DeviceSignature');

/**
 * Type definition for device signature
 * @description
 * Represents a validated COSE_Sign1 signature from the device.
 * This type is inferred from the deviceSignatureSchema and represents a Sign1 instance
 * that has been validated according to the COSE_Sign1 specification.
 *
 * @see {@link Sign1} - The Sign1 class from @auth0/cose library
 */
export type DeviceSignature = z.output<typeof deviceSignatureSchema>;
