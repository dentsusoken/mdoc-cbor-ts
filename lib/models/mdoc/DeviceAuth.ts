import { z } from 'zod';
import { DeviceMac, deviceMacSchema } from './DeviceMac';
import { DeviceSignature, deviceSignatureSchema } from './DeviceSignature';

export const deviceAuthSchema = z.union([
  z.object({
    deviceSignature: deviceSignatureSchema,
  }),
  z.object({
    deviceMac: deviceMacSchema,
  }),
]);

/**
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
