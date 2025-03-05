import { z } from 'zod';
import { docTypeSchema } from '../common';
import { DeviceKeyInfo, deviceKeyInfoSchema } from './DeviceKeyInfo';
import { digestAlgorithmSchema } from './DigestAlgorithm';
import { ValidityInfo, validityInfoSchema } from './ValidityInfo';
import { ValueDigests, valueDigestsSchema } from './ValueDigests';

/**
 * Schema for mobile security object in MSO
 * @description
 * Represents the core security object containing version, digest algorithm,
 * value digests, device key information, document type, and validity information.
 * This schema validates the structure of the mobile security object.
 *
 * @example
 * ```typescript
 * const mso = {
 *   version: "1.0",
 *   digestAlgorithm: "SHA-256",
 *   valueDigests: {},
 *   deviceKeyInfo: {},
 *   docType: "org.iso.18013.5.1.mDL",
 *   validityInfo: {}
 * };
 * const result = mobileSecurityObjectSchema.parse(mso); // Returns MobileSecurityObject
 * ```
 */
export const mobileSecurityObjectSchema = z.object({
  version: z.literal('1.0'),
  digestAlgorithm: digestAlgorithmSchema,
  valueDigests: valueDigestsSchema,
  deviceKeyInfo: deviceKeyInfoSchema,
  docType: docTypeSchema,
  validityInfo: validityInfoSchema,
});

/**
 * Type definition for mobile security object
 * @description
 * Represents a validated mobile security object structure
 *
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
