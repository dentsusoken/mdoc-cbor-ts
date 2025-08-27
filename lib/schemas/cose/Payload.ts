import { createBytesSchema } from '@/schemas/common/Bytes';

/**
 * Schema for COSE payload
 * @description
 * Represents COSE payload as a byte string containing the actual data to be signed or encrypted.
 * The payload can be detached (not included in the COSE structure) or attached (included in the structure).
 * This schema accepts null/undefined values to handle detached payloads.
 *
 * ```cddl
 * payload = bstr / nil
 * ```
 *
 * @example
 * ```typescript
 * const payload = new Uint8Array([0x01, 0x02, 0x03]); // Raw payload data
 * const result = payloadSchema.parse(payload); // Returns Uint8Array
 *
 * const detachedPayload = null; // Detached payload
 * const result2 = payloadSchema.parse(detachedPayload); // Returns null
 * ```
 */
export const payloadSchema = createBytesSchema('Payload').nullish();
