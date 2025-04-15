import { z } from 'zod';
import { DeviceKey, deviceKeySchema } from './DeviceKey';
import {
  KeyAuthorizations,
  keyAuthorizationsSchema,
} from './KeyAuthorizations';
import { KeyInfo, keyInfoSchema } from './KeyInfo';

/**
 * Schema for device key information in MSO
 * @description
 * Represents information about a device key including the key itself and optional
 * authorizations and metadata. This schema validates the structure of device key information.
 *
 * @example
 * ```typescript
 * const keyInfo = {
 *   deviceKey: new COSEKey({}),
 *   keyAuthorizations: {},
 *   keyInfo: {}
 * };
 * const result = deviceKeyInfoSchema.parse(keyInfo); // Returns DeviceKeyInfo
 * ```
 */
export const deviceKeyInfoSchema = z.map(z.any(), z.any()).transform((data) => {
  return z
    .object({
      deviceKey: deviceKeySchema,
      keyAuthorizations: keyAuthorizationsSchema.optional(),
      keyInfo: keyInfoSchema.optional(),
    })
    .parse(Object.fromEntries(data));
});

/**
 * Type definition for device key information
 * @description
 * Represents a validated device key information structure
 *
 * ```cddl
 * DeviceKeyInfo = {
 *  "deviceKey": DeviceKey,
 *  ? "keyAuthorizations": KeyAuthorizations,
 *  ? "keyInfo": KeyInfo
 * }
 * ```
 * @see {@link DeviceKey}
 * @see {@link KeyAuthorizations}
 * @see {@link KeyInfo}
 */
export type DeviceKeyInfo = z.infer<typeof deviceKeyInfoSchema>;
