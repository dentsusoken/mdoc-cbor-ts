import { z } from 'zod';
import { createMac0Schema } from '@/schemas/cose/Mac0';

/**
 * Schema for device MAC in mdoc
 * @description
 * Validates a COSE_Mac0 structure produced by a device and normalizes it to a
 * CBOR `Tag(17)` wrapping the validated Mac0 tuple.
 *
 * This schema is a thin, target-specific wrapper around the generic Mac0 schema
 * factory. It mirrors the behavior documented in the Mac0 schema:
 *
 * Supported input forms:
 * - Tuple (array): `[protected, unprotected, payload, tag]`
 *   - `protected`: `Uint8Array` (bstr-encoded headers)
 *   - `unprotected`: `HeaderMap`
 *   - `payload`: `Uint8Array | null`
 *   - `tag`: `Uint8Array`
 * - Tagged object: `Tag(tuple, 17)`
 * - Object with `getContentForEncoding()` returning the tuple
 *
 * Output:
 * - Always returns `Tag(17, [protected, unprotected, payload, tag])` on success
 *
 * Error behavior:
 * - Non-supported input types and wrong tag numbers are reported with
 *   contextual messages consistent with the container message utilities.
 *
 * ```cddl
 * DeviceMac = COSE_Mac0
 * ```
 *
 * @example
 * ```typescript
 * const protectedHeaders = new Uint8Array([0xa1, 0x01, 0x26]);
 * const unprotectedHeaders = new Map<number, unknown>([[4, new Uint8Array([1, 2, 3])]]);
 * const payload = new Uint8Array([0x48, 0x65, 0x6c, 0x6f]);
 * const tag = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
 *
 * const mac0Tuple = [protectedHeaders, unprotectedHeaders, payload, tag];
 * const result = deviceMacSchema.parse(mac0Array); // Tag(17, mac0Tuple)
 * ```
 *
 * @see {@link createMac0Schema}
 * @see {@link import('@/schemas/cose/Mac0') | Mac0 schema}
 */
export const deviceMacSchema = createMac0Schema('DeviceMac');

/**
 * Type definition for device MAC
 * @description
 * Represents a validated device MAC, which is always a CBOR Tag(17) instance wrapping the COSE_Mac0 tuple.
 * This type is inferred from deviceMacSchema, and it is always a Tag(17), never a plain tuple or any Mac0 class instance.
 */
export type DeviceMac = z.output<typeof deviceMacSchema>;
