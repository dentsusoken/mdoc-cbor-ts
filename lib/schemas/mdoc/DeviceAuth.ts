import { z } from 'zod';
import { DeviceMac, deviceMacSchema } from './DeviceMac';
import { DeviceSignature, deviceSignatureSchema } from './DeviceSignature';

/**
 * Schema for device authentication in mdoc
 * @description
 * Represents the device's authentication mechanism, which can be either a signature or a MAC.
 * This schema validates that the authentication is provided in one of these two forms.
 *
 * @example
 * ```typescript
 * const auth = { deviceSignature: sign1 };
 * const result = deviceAuthSchema.parse(auth); // Returns DeviceAuth
 * ```
 */
export const deviceAuthSchema = z.union([
  z.object({
    deviceSignature: deviceSignatureSchema,
  }),
  z.object({
    deviceMac: deviceMacSchema,
  }),
]);

/**
 * Type definition for device authentication
 * @description
 * Represents a validated device authentication mechanism
 *
 * ```cddl
 * DeviceAuth = {
 *  "deviceSignature": DeviceSignature, //
 *  "deviceMac": DeviceMac
 * }
 * ```
 * @see {@link DeviceSignature}
 * @see {@link DeviceMac}
 */
export type DeviceAuth = z.infer<typeof deviceAuthSchema>;
