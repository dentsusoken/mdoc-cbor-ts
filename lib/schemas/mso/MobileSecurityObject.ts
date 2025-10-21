import { z } from 'zod';
import { deviceKeyInfoSchema } from './DeviceKeyInfo';
import { validityInfoSchema } from './ValidityInfo';
import { valueDigestsSchema } from './ValueDigests';
import { createStrictMapSchema } from '@/schemas/containers/StrictMap';
import { createStrictMap } from '@/strict-map';
import { DigestAlgorithm } from '@/cose/types';

/**
 * Canonical field definitions (CDDL) for the Mobile Security Object (MSO).
 *
 * @cddl
 * ```
 * MobileSecurityObject = {
 *   version:          "1.0",
 *   digestAlgorithm:  DigestAlgorithm,
 *   valueDigests:     ValueDigests,
 *   deviceKeyInfo:    DeviceKeyInfo,
 *   docType:          tstr,
 *   validityInfo:     ValidityInfo
 * }
 * ```
 *
 * Each entry specifies a required field and its schema for the MSO.
 *
 * - `version`:          MSO version literal ("1.0")
 * - `digestAlgorithm`:  Supported digest algorithm enum
 * - `valueDigests`:     Map<NameSpace, DigestIDs>
 * - `deviceKeyInfo`:    Device public key info container
 * - `docType`:          Document type string (min length 1)
 * - `validityInfo`:     Map with CBOR Tag(0) UTC datetime values for validity
 */
export const mobileSecurityObjectEntries = [
  ['version', z.literal('1.0')],
  ['digestAlgorithm', z.nativeEnum(DigestAlgorithm)],
  ['valueDigests', valueDigestsSchema],
  ['deviceKeyInfo', deviceKeyInfoSchema],
  ['docType', z.string().min(1)],
  ['validityInfo', validityInfoSchema],
] as const;

/**
 * Utility for constructing a Mobile Security Object map with type inference.
 *
 * @description
 * Use this to create an empty or pre-populated MSO map instance that is
 * type-safe and restricted to the canonical MSO fields.
 *
 * @see {mobileSecurityObjectEntries}
 * @see {MobileSecurityObject}
 */
export const createMobileSecurityObject = createStrictMap<
  typeof mobileSecurityObjectEntries
>;

/**
 * Zod schema for the canonical Mobile Security Object (MSO).
 *
 * @description
 * Validates an MSO according to the CDDL and ISO 18013-5/7 requirements.
 * - Enforces that all required fields are present: `version`, `digestAlgorithm`, `valueDigests`, `deviceKeyInfo`, `docType`, and `validityInfo`.
 * - Each field is validated according to its respective schema:
 *   - `version`: must be the literal string "1.0"
 *   - `digestAlgorithm`: must be a supported DigestAlgorithm enum value
 *   - `valueDigests`: must be a non-empty map from NameSpace to DigestIDs
 *   - `deviceKeyInfo`: must contain valid device public key information
 *   - `docType`: must be a non-empty string designating the document type
 *   - `validityInfo`: must be a strict map with valid tagged UTC date-times
 * - No unknown fields are allowed.
 *
 * @see {@link mobileSecurityObjectEntries}
 * @see {@link MobileSecurityObject}
 *
 * @example
 * ```typescript
 * const input = new Map([
 *   ['version', '1.0'],
 *   ['digestAlgorithm', 'SHA-256'],
 *   ['valueDigests', new Map([['org.iso.18013.5.1', digestIDs]])],
 *   ['deviceKeyInfo', { deviceKey: myDeviceKey }],
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['validityInfo', new Map([
 *     ['signed', '2025-01-01T00:00:00Z'],
 *     ['validFrom', '2025-01-01T00:00:00Z'],
 *     ['validUntil', '2025-01-02T00:00:00Z']
 *   ])]
 * ]);
 * mobileSecurityObjectSchema.parse(input); // returns validated MobileSecurityObject
 * ```
 */
export const mobileSecurityObjectSchema = createStrictMapSchema({
  target: 'MobileSecurityObject',
  entries: mobileSecurityObjectEntries,
});

/**
 * Type representing a fully validated Mobile Security Object (MSO).
 *
 * @description
 * This type is the output of {@link mobileSecurityObjectSchema}, providing
 * strong typing and field access. Each field is validated and
 * normalized according to its respective schema:
 * - `version`: string (usually "1.0")
 * - `digestAlgorithm`: string (e.g., "SHA-256")
 * - `valueDigests`: Map<string, DigestIDs>
 * - `deviceKeyInfo`: DeviceKeyInfo
 * - `docType`: string
 * - `validityInfo`: ValidityInfo (map of tagged datetimes)
 *
 * @see {@link valueDigestsSchema}
 * @see {@link deviceKeyInfoSchema}
 * @see {@link validityInfoSchema}
 */
export type MobileSecurityObject = z.output<typeof mobileSecurityObjectSchema>;
