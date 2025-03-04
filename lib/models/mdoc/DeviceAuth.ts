import { z } from 'zod';
import { deviceSignatureSchema, DeviceSignature } from './DeviceSignature';
import { deviceMacSchema, DeviceMac } from './DeviceMac';

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
