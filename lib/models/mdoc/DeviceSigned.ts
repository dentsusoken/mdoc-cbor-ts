import { z } from 'zod';
import { deviceAuthSchema } from './DeviceAuth';
import { deviceNameSpacesBytesSchema } from './DeviceNameSpacesBytes';

export const deviceSignedSchema = z.object({
  nameSpaces: deviceNameSpacesBytesSchema,
  deviceAuth: deviceAuthSchema,
});

/**
 * ```cddl
 * DeviceSigned = {
 *  "nameSpaces": DeviceNameSpacesBytes,
 *  "deviceAuth": DeviceAuth
 * }
 * ```
 * @see {@link DeviceNameSpacesBytes}
 * @see {@link DeviceAuth}
 */
export type DeviceSigned = z.infer<typeof deviceSignedSchema>;
