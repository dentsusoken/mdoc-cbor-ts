import { z } from 'zod';
import { deviceMacSchema } from './DeviceMac';
import { deviceSignatureSchema } from './DeviceSignature';

/**
 * Object schema for device authentication validation
 * @description
 * Validates that the device authentication object has at least one authentication method.
 * Both deviceSignature and deviceMac are optional, but at least one must be present.
 *
 * ```cddl
 * DeviceAuth = {
 *  ? deviceSignature: DeviceSignature, // optional, but at least one is required
 *  ? deviceMac: DeviceMac             // optional, but at least one is required
 * }
 * ```
 *
 * @example
 * ```typescript
 * const auth = { deviceSignature: sign1.getContentForEncoding() };
 * const result = deviceAuthObjectSchema.parse(auth); // Returns DeviceAuth
 *
 * const auth2 = { deviceMac: mac0.getContentForEncoding() };
 * const result2 = deviceAuthObjectSchema.parse(auth2); // Returns DeviceAuth
 *
 * const auth3 = {
 *   deviceSignature: sign1.getContentForEncoding(),
 *   deviceMac: mac0.getContentForEncoding()
 * };
 * const result3 = deviceAuthObjectSchema.parse(auth3); // Returns DeviceAuth
 * ```
 */
export const deviceAuthObjectSchema = z
  .object({
    deviceSignature: deviceSignatureSchema.optional(),
    deviceMac: deviceMacSchema.optional(),
  })
  .refine((obj) => obj.deviceSignature || obj.deviceMac, {
    message:
      'DeviceAuth: At least one authentication method (deviceSignature or deviceMac) must be provided.',
  });

/**
 * Schema for device authentication in mdoc
 * @description
 * Represents the device's authentication mechanism, which can be either a signature, a MAC, or both.
 * This schema validates that at least one authentication method is provided.
 *
 * The schema accepts a Map input and transforms it to an object for validation.
 *
 * @example
 * ```typescript
 * const auth = new Map([['deviceSignature', sign1.getContentForEncoding()]]);
 * const result = deviceAuthSchema.parse(auth); // Returns DeviceAuth
 *
 * const auth2 = new Map([['deviceMac', mac0.getContentForEncoding()]]);
 * const result2 = deviceAuthSchema.parse(auth2); // Returns DeviceAuth
 *
 * const auth3 = new Map([
 *   ['deviceSignature', sign1.getContentForEncoding()],
 *   ['deviceMac', mac0.getContentForEncoding()]
 * ]);
 * const result3 = deviceAuthSchema.parse(auth3); // Returns DeviceAuth
 * ```
 */
export const deviceAuthSchema = z
  .map(z.any(), z.any(), {
    invalid_type_error:
      'DeviceAuth: Expected a Map with authentication method keys and values. Please provide a valid authentication mapping.',
    required_error:
      'DeviceAuth: This field is required. Please provide an authentication mapping.',
  })
  .transform((v) => {
    return deviceAuthObjectSchema.parse(Object.fromEntries(v));
  });

/**
 * Type definition for device authentication
 * @description
 * Represents a validated device authentication mechanism
 *
 * @see {@link DeviceSignature}
 * @see {@link DeviceMac}
 */
export type DeviceAuth = z.output<typeof deviceAuthSchema>;
