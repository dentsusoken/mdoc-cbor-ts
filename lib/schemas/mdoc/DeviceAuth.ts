import { z } from 'zod';
import { deviceMacSchema } from './DeviceMac';
import { deviceSignatureSchema } from './DeviceSignature';
import { createStructSchema } from '@/schemas/common/Struct';

export const DEVICE_AUTH_AT_LEAST_ONE_MESSAGE =
  'DeviceAuth: At least one authentication method (deviceSignature or deviceMac) must be provided.';

/**
 * Builds the object schema for device authentication validation.
 * @description
 * Validates an object with optional `deviceSignature` and `deviceMac` fields and
 * enforces that at least one of them is present.
 *
 * ```cddl
 * DeviceAuth = {
 *  ? deviceSignature: DeviceSignature,
 *  ? deviceMac: DeviceMac
 * }
 * ```
 *
 * Validation rule:
 * - Requires at least one of `deviceSignature` or `deviceMac` to be provided
 *
 * @example
 * ```typescript
 * const ok1 = deviceAuthObjectSchema.parse({ deviceSignature: sign1.getContentForEncoding() });
 * const ok2 = deviceAuthObjectSchema.parse({ deviceMac: mac0.getContentForEncoding() });
 * const ok3 = deviceAuthObjectSchema.parse({
 *   deviceSignature: sign1.getContentForEncoding(),
 *   deviceMac: mac0.getContentForEncoding(),
 * });
 * ```
 */
export const deviceAuthObjectSchema = z
  .object({
    deviceSignature: deviceSignatureSchema.optional(),
    deviceMac: deviceMacSchema.optional(),
  })
  .refine((obj) => obj.deviceSignature || obj.deviceMac, {
    message: DEVICE_AUTH_AT_LEAST_ONE_MESSAGE,
  });

/**
 * Map schema for device authentication in mdoc.
 * @description
 * Accepts a `Map<string, unknown>` and validates it using
 * {@link deviceAuthObjectSchema}. Input is converted to a plain object for
 * validation and the parsed result is returned as a new `Map`.
 *
 * Represents the device's authentication mechanism, which can be either a
 * signature, a MAC, or both.
 *
 * @example
 * ```typescript
 * const auth1 = new Map([['deviceSignature', sign1.getContentForEncoding()]]);
 * const result1 = deviceAuthSchema.parse(auth1); // Map<string, unknown>
 *
 * const auth2 = new Map([['deviceMac', mac0.getContentForEncoding()]]);
 * const result2 = deviceAuthSchema.parse(auth2); // Map<string, unknown>
 *
 * const auth3 = new Map([
 *   ['deviceSignature', sign1.getContentForEncoding()],
 *   ['deviceMac', mac0.getContentForEncoding()],
 * ]);
 * const result3 = deviceAuthSchema.parse(auth3); // Map<string, unknown>
 * ```
 *
 * @see {@link createStructSchema}
 */
export const deviceAuthSchema = createStructSchema({
  target: 'DeviceAuth',
  objectSchema: deviceAuthObjectSchema,
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
