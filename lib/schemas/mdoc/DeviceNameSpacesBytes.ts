import { z } from 'zod';
import { createTag24Schema } from '@/schemas/common/Tag24';

/**
 * Schema for CBOR-encoded device-signed namespaces
 * @description
 * Represents device-signed namespaces encoded as a CBOR tag.
 * This schema validates that the data is a valid CBOR tag containing device-signed namespaces.
 *
 * ```cddl
 * DeviceNameSpacesBytes = #6.24(bstr .cbor DeviceNameSpaces)
 * ```
 *
 * @example
 * ```typescript
 * import { Tag } from 'cbor-x';
 *
 * // CBOR-encoded device namespaces as a Tag 24
 * const tag = new Tag(encodeCbor(deviceNameSpaces), 24);
 * const result = deviceNameSpacesBytesSchema.parse(tag); // Returns Tag
 * ```
 */
export const deviceNameSpacesBytesSchema = createTag24Schema(
  'DeviceNameSpacesBytes'
);

/**
 * Type definition for CBOR-encoded device-signed namespaces
 * @description
 * Represents validated CBOR-encoded device-signed namespaces
 *
 * @see {@link DeviceNameSpaces}
 */
export type DeviceNameSpacesBytes = z.output<
  typeof deviceNameSpacesBytesSchema
>;
