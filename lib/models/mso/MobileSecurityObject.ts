import { z } from 'zod';
import { valueDigestsSchema, ValueDigests } from './ValueDigests';
import { deviceKeyInfoSchema, DeviceKeyInfo } from './DeviceKeyInfo';
import { docTypeSchema } from '../common';
import { validityInfoSchema, ValidityInfo } from './ValidityInfo';

export const mobileSecurityObjectSchema = z.object({
  version: z.literal('1.0'),
  // TODO: digestAlgorithm should be defined in the common schema
  digestAlgorithm: z.literal('SHA-256'),
  valueDigests: valueDigestsSchema,
  deviceKeyInfo: deviceKeyInfoSchema,
  docType: docTypeSchema,
  validityInfo: validityInfoSchema,
});

/**
 * ```cddl
 * MobileSecurityObject = {
 *  "version": tstr,
 *  "digestAlgorithm": tstr,
 *  "valueDigests": ValueDigests,
 *  "deviceKeyInfo": DeviceKeyInfo,
 *  "docType": tstr,
 *  "validityInfo": ValidityInfo
 * }
 * ```
 * @see {@link ValueDigests}
 * @see {@link DeviceKeyInfo}
 * @see {@link ValidityInfo}
 */
export type MobileSecurityObject = z.infer<typeof mobileSecurityObjectSchema>;
