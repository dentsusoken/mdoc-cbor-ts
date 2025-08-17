import { z } from 'zod';
import { createTag24Schema } from '@/schemas/common/Tag24';

/**
 * Schema for CBOR Tag 24 encoded mobile security object
 * @description
 * Validates a CBOR Tag 24 structure containing embedded CBOR bytes of a mobile security object.
 * The schema ensures the input is a Tag instance with tag number 24 and a Uint8Array value
 * containing the CBOR-encoded mobile security object.
 *
 * @example
 * ```typescript
 * import { Tag } from 'cbor-x';
 * import { createTag24 } from '@/cbor/createTag24';
 *
 * const mso = { version: '1.0', digestAlgorithm: 'SHA-256' };
 * const tag = createTag24(mso);
 * const result = mobileSecurityObjectBytesSchema.parse(tag); // Returns Tag
 * ```
 */
export const mobileSecurityObjectBytesSchema = createTag24Schema(
  'MobileSecurityObjectBytes'
);

/**
 * Type definition for CBOR Tag 24 encoded mobile security object
 * @description
 * Represents a validated CBOR Tag 24 structure containing embedded CBOR bytes
 * of a mobile security object. The Tag has tag number 24 and a Uint8Array value.
 *
 * ```cddl
 * MobileSecurityObjectBytes = #6.24(bstr .cbor MobileSecurityObject)
 * ```
 * @see {@link MobileSecurityObject}
 */
export type MobileSecurityObjectBytes = z.output<
  typeof mobileSecurityObjectBytesSchema
>;
