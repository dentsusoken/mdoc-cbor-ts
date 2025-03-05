import { z } from 'zod';
import { bytesSchema } from '../common';

/**
 * Schema for CBOR-encoded mobile security object
 * @description
 * Represents a mobile security object encoded as a binary string.
 * This schema validates that the data is a valid binary string.
 *
 * @example
 * ```typescript
 * const bytes = Buffer.from([]);
 * const result = mobileSecurityObjectBytesSchema.parse(bytes); // Returns MobileSecurityObjectBytes
 * ```
 */
export const mobileSecurityObjectBytesSchema = bytesSchema;

/**
 * Type definition for CBOR-encoded mobile security object
 * @description
 * Represents a validated CBOR-encoded mobile security object
 *
 * ```cddl
 * MobileSecurityObjectBytes = #6.24(bstr .cbor MobileSecurityObject)
 * ```
 * @see {@link MobileSecurityObject}
 */
export type MobileSecurityObjectBytes = z.infer<
  typeof mobileSecurityObjectBytesSchema
>;
