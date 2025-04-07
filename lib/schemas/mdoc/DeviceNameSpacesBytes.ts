import { TypedMap } from '@jfromaniello/typedmap';
import { z } from 'zod';
import { ByteString } from '../../cbor';
import { KVMap } from '../../types';
import { DeviceNameSpaces, deviceNameSpacesSchema } from './DeviceNameSpaces';

/**
 * Schema for CBOR-encoded device-signed namespaces
 * @description
 * Represents device-signed namespaces encoded as a CBOR tag.
 * This schema validates that the data is a valid CBOR tag containing device-signed namespaces.
 *
 * @example
 * ```typescript
 * const bytes = new Tag(24, Buffer.from([]));
 * const result = deviceNameSpacesBytesSchema.parse(bytes);
 * ```
 */
export const deviceNameSpacesBytesSchema = z
  .instanceof(ByteString<TypedMap<KVMap<DeviceNameSpaces>>>)
  // .refine((v) => console.log('object :>> ', v.data));
  .refine((v) => deviceNameSpacesSchema.parse(Object.fromEntries(v.data)));

/**
 * Type definition for CBOR-encoded device-signed namespaces
 * @description
 * Represents validated CBOR-encoded device-signed namespaces
 *
 * ```cddl
 * DeviceNameSpacesBytes = #6.24(bstr .cbor DeviceNameSpaces)
 * ```
 * @see {@link DeviceNameSpaces}
 */
export type DeviceNameSpacesBytes = z.infer<typeof deviceNameSpacesBytesSchema>;
