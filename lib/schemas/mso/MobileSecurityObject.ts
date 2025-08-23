import { z } from 'zod';
import { docTypeSchema } from '../common';
import { deviceKeyInfoSchema } from './DeviceKeyInfo';
import { digestAlgorithmSchema } from './DigestAlgorithm';
import { validityInfoSchema } from './ValidityInfo';
import { valueDigestsSchema } from './ValueDigests';
import { createStructSchema } from '../common/Struct';
import { versionSchema } from '@/schemas/common/Version';

export const mobileSecurityObjectObjectSchema = z.object({
  version: versionSchema,
  digestAlgorithm: digestAlgorithmSchema,
  valueDigests: valueDigestsSchema,
  deviceKeyInfo: deviceKeyInfoSchema,
  docType: docTypeSchema,
  validityInfo: validityInfoSchema,
});

/**
 * Schema for mobile security object in MSO
 * @description
 * Validates a `Map<string, unknown>` (e.g., CBOR-decoded) that is transformed into
 * a plain object and checked against `mobileSecurityObjectObjectSchema`.
 *
 * Container errors are prefixed with `MobileSecurityObject: ...` by `createStructSchema`.
 * Field-level validation is delegated to:
 * - `digestAlgorithmSchema`
 * - `valueDigestsSchema` (Map<NameSpace, DigestIDs>)
 * - `deviceKeyInfoSchema` (Map-based COSE key info)
 * - `docTypeSchema`
 * - `validityInfoSchema` (DateTime instances via CBOR tag 0)
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
 *
 * @example
 * ```typescript
 * import { typedMap } from '@/utils/typedMap';
 * import { mobileSecurityObjectSchema } from '@/schemas/mso/MobileSecurityObject';
 * import { DateTime } from '@/cbor/DateTime';
 *
 * const input = typedMap([
 *   ['version', '1.0'],
 *   ['digestAlgorithm', 'SHA-256'],
 *   ['valueDigests', [
 *     ['org.iso.18013.5.1', [[1, new Uint8Array([1])]]],
 *   ]],
 *   ['deviceKeyInfo', [
 *     ['deviceKey', [[1, 2]]],
 *   ]],
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['validityInfo', [
 *     ['signed', new DateTime('2024-03-20T10:00:00Z')],
 *     ['validFrom', new DateTime('2024-03-20T10:00:00Z')],
 *     ['validUntil', new DateTime('2025-03-20T10:00:00Z')],
 *   ]],
 * ]);
 *
 * const mso = mobileSecurityObjectSchema.parse(input); // mso is a MobileSecurityObject
 * // mso is a validated object with typed fields
 * ```
 */
export const mobileSecurityObjectSchema = createStructSchema({
  target: 'MobileSecurityObject',
  objectSchema: mobileSecurityObjectObjectSchema,
});

/**
 * Type definition for mobile security object
 * @description
 * Represents a validated mobile security object structure
 *
 * @see {@link ValueDigests}
 * @see {@link DeviceKeyInfo}
 * @see {@link ValidityInfo}
 */
export type MobileSecurityObject = z.output<typeof mobileSecurityObjectSchema>;
