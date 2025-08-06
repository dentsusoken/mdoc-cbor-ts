import { z } from 'zod';
import { deviceAuthSchema } from './DeviceAuth';
import { deviceNameSpacesBytesSchema } from './DeviceNameSpacesBytes';

/**
 * Schema for device-signed data in mdoc
 * @description
 * Represents the portion of the mdoc that is signed by the device.
 * This schema validates the structure of device-signed data including namespaces and authentication.
 *
 * ```cddl
 * DeviceSigned = {
 *  "nameSpaces": DeviceNameSpacesBytes,
 *  "deviceAuth": DeviceAuth
 * }
 * ```
 *
 * @example
 * ```typescript
 * const deviceSigned = {
 *   nameSpaces: new Tag(24, Buffer.from([])),
 *   deviceAuth: { deviceSignature: sign1 }
 * };
 * const result = deviceSignedSchema.parse(deviceSigned); // Returns DeviceSigned
 * ```
 */
export const deviceSignedSchema = z.map(z.any(), z.any()).transform((v) => {
  return z
    .object({
      nameSpaces: deviceNameSpacesBytesSchema,
      deviceAuth: deviceAuthSchema,
    })
    .parse(Object.fromEntries(v));
});

/**
 * Type definition for device-signed data
 * @description
 * Represents a validated device-signed data structure
 *
 * @see {@link DeviceNameSpacesBytes}
 * @see {@link DeviceAuth}
 */
export type DeviceSigned = z.infer<typeof deviceSignedSchema>;
