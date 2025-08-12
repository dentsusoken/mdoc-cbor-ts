import { TypedMap } from '@jfromaniello/typedmap';
import { z } from 'zod';
import { ByteString } from '@/cbor/ByteString';
import { deviceNameSpacesSchema } from './DeviceNameSpaces';

/**
 * Schema for CBOR-encoded device-signed namespaces
 * @description
 * Represents device-signed namespaces encoded as a CBOR tag.
 * This schema validates that the data is a valid CBOR tag containing device-signed namespaces.
 *
 * ```cddl
 * DeviceNameSpacesBytes = #6.24(bstr .cbor DeviceNameSpaces)
 * ```
 * @example
 * ```typescript
 * const deviceNameSpaces = new TypedMap([
 *   ['org.iso.18013.5.1', {}]
 * ]);
 * const bytes = new ByteString(deviceNameSpaces);
 * const result = deviceNameSpacesBytesSchema.parse(bytes);
 * ```
 */
export const deviceNameSpacesBytesSchema = z
  .instanceof(ByteString<TypedMap<[string, unknown]>>, {
    message:
      'DeviceNameSpacesBytes: Expected a ByteString instance containing device-signed namespaces. Please provide a valid CBOR-encoded device namespaces.',
  })
  .refine((v) => deviceNameSpacesSchema.parse(v.data.esMap));

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
