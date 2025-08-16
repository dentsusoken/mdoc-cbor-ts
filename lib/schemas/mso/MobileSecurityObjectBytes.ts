import { z } from 'zod';
import { Tag } from 'cbor-x';

export const MOBILE_SECURITY_OBJECT_INVALID_TYPE_MESSAGE =
  'MobileSecurityObject: Please provide a Tag with tag 24 and a Map value.';

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
export const mobileSecurityObjectBytesSchema = z
  .instanceof(Tag, {
    message: MOBILE_SECURITY_OBJECT_INVALID_TYPE_MESSAGE,
  })
  .refine((tag) => tag.tag === 24 && tag.value instanceof Map, {
    message: MOBILE_SECURITY_OBJECT_INVALID_TYPE_MESSAGE,
  });

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
export type MobileSecurityObjectBytes = z.output<
  typeof mobileSecurityObjectBytesSchema
>;
