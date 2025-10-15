import { z } from 'zod';
import { docTypeSchema } from '../common';
import { deviceKeyInfoSchema } from './DeviceKeyInfo';
import { digestAlgorithmSchema } from './DigestAlgorithm';
import { validityInfoSchema } from './ValidityInfo';
import { valueDigestsSchema } from './ValueDigests';
import { versionSchema } from '@/schemas/common/Version';
import { createStrictMapSchema } from '../common/StrictMap';
import { createStrictMap } from '@/strict-map';

/**
 * Canonical entries for the Mobile Security Object (MSO) structure.
 *
 * @description
 * Defines the full set of allowed keys and their associated value schemas for an MSO,
 * as per ISO 18013-5. The order of entries is canonical and must not be changed.
 * Used with strict map utilities to validate, construct, or serialize an MSO.
 *
 * Fields:
 * - `version`: MSO version string (must match `versionSchema`)
 * - `digestAlgorithm`: Digest algorithm identifier string (see `digestAlgorithmSchema`)
 * - `valueDigests`: Map of value digests (see `valueDigestsSchema`)
 * - `deviceKeyInfo`: Device public key container (see `deviceKeyInfoSchema`)
 * - `docType`: Document type string (see `docTypeSchema`)
 * - `validityInfo`: Structured validity data (see `validityInfoSchema`)
 *
 * @see {@link versionSchema}
 * @see {@link digestAlgorithmSchema}
 * @see {@link valueDigestsSchema}
 * @see {@link deviceKeyInfoSchema}
 * @see {@link docTypeSchema}
 * @see {@link validityInfoSchema}
 */
export const mobileSecurityObjectEntries = [
  ['version', versionSchema],
  ['digestAlgorithm', digestAlgorithmSchema],
  ['valueDigests', valueDigestsSchema],
  ['deviceKeyInfo', deviceKeyInfoSchema],
  ['docType', docTypeSchema],
  ['validityInfo', validityInfoSchema],
] as const;

/**
 * Schema for the Mobile Security Object (MSO) according to ISO 18013-5.
 *
 * @description
 * Validates a `Map<string, unknown>` (such as one produced by CBOR decoding)
 * containing the expected MSO fields. Accepts only the canonical fields
 * specified in `mobileSecurityObjectEntries` and enforces type correctness
 * for each field via dedicated field schemas.
 *
 * This schema ensures:
 * - All six fields (`version`, `digestAlgorithm`, `valueDigests`, `deviceKeyInfo`, `docType`, `validityInfo`) are present.
 * - No unknown fields are allowed.
 * - All value types strictly conform to their respective schemas:
 *   - `version`: MSO version string (e.g., `'1.0'`)
 *   - `digestAlgorithm`: Algorithm identifier string
 *   - `valueDigests`: Map from NameSpace to DigestIDs
 *   - `deviceKeyInfo`: Device public key container (COSE key)
 *   - `docType`: Document type string (e.g., `'org.iso.18013.5.1.mDL'`)
 *   - `validityInfo`: Map with CBOR Tag(0) UTC datetime values
 *
 * All errors are prefixed with `MobileSecurityObject:` for clarity.
 *
 * @see {@link valueDigestsSchema}
 * @see {@link deviceKeyInfoSchema}
 * @see {@link validityInfoSchema}
 * @see {@link versionSchema}
 * @see {@link digestAlgorithmSchema}
 * @see {@link docTypeSchema}
 *
 * @example
 * ```typescript
 * import { mobileSecurityObjectSchema } from '@/schemas/mso/MobileSecurityObject';
 *
 * // Construct a Map representing an MSO
 * const input = new Map<unknown, unknown>([
 *   ['version', '1.0'],
 *   ['digestAlgorithm', 'SHA-256'],
 *   ['valueDigests', new Map([
 *     ['org.iso.18013.5.1', new Map([[1, new Uint8Array([1])]])],
 *   ])],
 *   ['deviceKeyInfo', new Map([
 *     ['deviceKey', new Map([[1, 2]])],
 *   ])],
 *   ['docType', 'org.iso.18013.5.1.mDL'],
 *   ['validityInfo', new Map([
 *     ['signed', '2024-03-20T10:00:00Z'],
 *     ['validFrom', '2024-03-20T10:00:00Z'],
 *     ['validUntil', '2025-03-20T10:00:00Z'],
 *   ])],
 * ]);
 *
 * // Parse and validate with strong typing:
 * const mso = mobileSecurityObjectSchema.parse(input); // MobileSecurityObject
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
 * - `valueDigests`: Map<NameSpace, DigestIDs>
 * - `deviceKeyInfo`: DeviceKeyInfo
 * - `docType`: string
 * - `validityInfo`: ValidityInfo (map of tagged datetimes)
 *
 * @see {@link valueDigestsSchema}
 * @see {@link deviceKeyInfoSchema}
 * @see {@link validityInfoSchema}
 */
export type MobileSecurityObject = z.output<typeof mobileSecurityObjectSchema>;

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
