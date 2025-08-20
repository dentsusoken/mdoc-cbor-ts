import { z } from 'zod';
import { createMac0Schema } from '../cose/Mac0';

/**
 * Schema for device MAC in mdoc
 * @description
 * Represents a COSE_Mac0 MAC created by the device for mdoc authentication.
 * This schema validates COSE_Mac0 arrays and transforms them into Mac0 objects.
 * The device MAC provides integrity protection and authentication for mdoc data.
 *
 * ```cddl
 * DeviceMac = COSE_Mac0
 * ```
 *
 * @example
 * ```typescript
 * const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]); // CBOR-encoded {1: -7}
 * const unprotectedHeaders = new Map<number, unknown>([[4, new Uint8Array([1, 2, 3])]]);
 * const payload = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
 * const tag = new Uint8Array([0x12, 0x34, 0x56, 0x78]); // MAC tag
 *
 * const mac0Array = [protectedHeaders, unprotectedHeaders, payload, tag];
 * const result = deviceMacSchema.parse(mac0Array); // Returns Mac0 instance
 * ```
 */
export const deviceMacSchema = createMac0Schema('DeviceMac');

/**
 * Type definition for device MAC
 * @description
 * Represents a validated COSE_Mac0 MAC from the device.
 * This type is inferred from the deviceMacSchema and represents a Mac0 instance
 * that has been validated according to the COSE_Mac0 specification.
 *
 * @see {@link Mac0} - The Mac0 class from @auth0/cose library
 */
export type DeviceMac = z.output<typeof deviceMacSchema>;
