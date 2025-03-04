import { z } from 'zod';
import { deviceKeySchema, DeviceKey } from './DeviceKey';
import {
  keyAuthorizationsSchema,
  KeyAuthorizations,
} from './KeyAuthorizations';
import { keyInfoSchema, KeyInfo } from './KeyInfo';

export const deviceKeyInfoSchema = z.object({
  deviceKey: deviceKeySchema,
  keyAuthorizations: keyAuthorizationsSchema.optional(),
  keyInfo: keyInfoSchema.optional(),
});

/**
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
