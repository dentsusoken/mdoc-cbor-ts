import { z } from 'zod';
import { deviceAuthSchema } from './DeviceAuth';
import { deviceNameSpacesBytesSchema } from './DeviceNameSpacesBytes';
import { createStructSchema } from '@/schemas/common/Struct';

/**
 * Object schema for device-signed data validation
 * @description
 * Validates that a device-signed object has the required properties and types.
 * This object schema is used internally by {@link deviceSignedSchema} after transforming
 * the input Map into a plain object.
 *
 * ```cddl
 * DeviceSigned = {
 *  "nameSpaces": DeviceNameSpacesBytes,
 *  "deviceAuth": DeviceAuth
 * }
 * ```
 *
 * Properties:
 * - nameSpaces: {@link DeviceNameSpacesBytes}
 * - deviceAuth: {@link DeviceAuth}
 */
export const deviceSignedObjectSchema = z.object({
  nameSpaces: deviceNameSpacesBytesSchema,
  deviceAuth: deviceAuthSchema,
});

/**
 * Schema for device-signed data in mdoc
 * @description
 * Represents the portion of the mdoc that is signed by the device.
 * This schema validates the structure of device-signed data including namespaces and authentication.
 * The schema accepts a Map input and transforms it to a plain object for validation.
 *
 * @example
 * ```typescript
 * const deviceSigned = new Map([
 *   ['nameSpaces', byteString],
 *   ['deviceAuth', new Map([['deviceSignature', sign1.getContentForEncoding()]])]
 * ]);
 * const result = deviceSignedSchema.parse(deviceSigned); // Returns DeviceSigned
 * ```
 *
 * @see {@link DeviceNameSpacesBytes}
 * @see {@link DeviceAuth}
 * @see {@link deviceSignedObjectSchema}
 */
export const deviceSignedSchema = createStructSchema({
  target: 'DeviceSigned',
  objectSchema: deviceSignedObjectSchema,
});

/**
 * Type definition for device-signed data
 * @description
 * Represents a validated device-signed data structure
 *
 * @see {@link DeviceNameSpacesBytes}
 * @see {@link DeviceAuth}
 */
export type DeviceSigned = z.output<typeof deviceSignedSchema>;
