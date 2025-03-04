import { z } from 'zod';
import { deviceNameSpacesBytesSchema } from './DeviceNameSpacesBytes';
import { deviceAuthSchema } from './DeviceAuth';

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
