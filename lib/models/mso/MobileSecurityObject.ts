import { z } from 'zod';
import { docTypeSchema } from '../common';
import { DeviceKeyInfo, deviceKeyInfoSchema } from './DeviceKeyInfo';
import { digestAlgorithmSchema } from './DigestAlgorithm';
import { ValidityInfo, validityInfoSchema } from './ValidityInfo';
import { ValueDigests, valueDigestsSchema } from './ValueDigests';

export const mobileSecurityObjectSchema = z.object({
  version: z.literal('1.0'),
  digestAlgorithm: digestAlgorithmSchema,
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
