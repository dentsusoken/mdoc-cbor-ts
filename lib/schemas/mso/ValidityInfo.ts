import { z } from 'zod';
import { dateTimeSchema } from '@/schemas/common/values/DateTime';
import { createStrictMapSchema } from '@/schemas/common/containers/StrictMap';
import { createStrictMap } from '@/strict-map';

/**
 * The canonical field entries for the MSO ValidityInfo structure.
 *
 * @description
 * Describes the entries for a Mobile Security Object's (MSO) validity information,
 * including required and optional date-time fields. Each field expects either
 * an ISO 8601 date-time string or a CBOR Tag(0), both normalized to
 * the "YYYY-MM-DDTHH:MM:SSZ" format. This constant is meant to be used
 * with `createStrictMapSchema` or similar struct validation utilities.
 *
 * Fields:
 * - `signed`:   REQUIRED.   Date/time the MSO was signed.
 * - `validFrom`: REQUIRED.  Date/time when the document becomes valid.
 * - `validUntil`: REQUIRED. Date/time when the document expires.
 * - `expectedUpdate`: OPTIONAL. Date/time by which the document should be updated.
 *
 * @see {validityInfoSchema}
 */
export const validityInfoEntries = [
  ['signed', dateTimeSchema],
  ['validFrom', dateTimeSchema],
  ['validUntil', dateTimeSchema],
  ['expectedUpdate', dateTimeSchema.optional()],
] as const;

/**
 * Zod schema for Mobile Security Object (MSO) ValidityInfo.
 *
 * @description
 * Validates a Map for the ValidityInfo section of an MSO, requiring or allowing fields as specified by
 * `validityInfoEntries`. This schema enforces:
 *   - All required fields (`signed`, `validFrom`, `validUntil`) must be present, with date-time values.
 *   - `expectedUpdate` is optional.
 *   - No unknown fields are allowed.
 *   - Field values must be either ISO 8601/RFC 3339 date-time strings (e.g. "2024-03-20T10:00:00Z") or
 *     CBOR Tag(0) objects containing such normalized strings.
 *   - All output values are normalized as CBOR Tag(0) objects with "YYYY-MM-DDTHH:MM:SSZ" UTC format.
 *
 * Input is expected to be a `Map<string, unknown>`, such as from CBOR decoding.
 *
 * @example
 * // With all fields:
 * import { validityInfoSchema } from '@/schemas/mso/ValidityInfo';
 * const map = new Map([
 *   ['signed', '2024-03-20T10:00:00Z'],
 *   ['validFrom', '2024-03-20T10:00:00Z'],
 *   ['validUntil', '2025-03-20T10:00:00Z'],
 *   ['expectedUpdate', '2024-09-20T10:00:00Z'],
 * ]);
 * const result = validityInfoSchema.parse(map);
 * // result is a Map with Tag(0) objects as values
 *
 * @example
 * // With only required fields:
 * const map = new Map([
 *   ['signed', '2025-01-01T00:00:00Z'],
 *   ['validFrom', '2025-01-01T00:00:00Z'],
 *   ['validUntil', '2026-01-01T00:00:00Z'],
 * ]);
 * const result = validityInfoSchema.parse(map);
 * // result.has('expectedUpdate') === false
 *
 * @see validityInfoEntries
 */
export const validityInfoSchema = createStrictMapSchema({
  target: 'ValidityInfo',
  entries: validityInfoEntries,
});

/**
 * Type representing validated ValidityInfo data structure.
 *
 * @description
 * This type represents a ValidityInfo map after validation, where all field values
 * are CBOR Tag(0) objects holding normalized RFC 3339 date-time strings
 * ("YYYY-MM-DDTHH:MM:SSZ").
 *
 * @see validityInfoSchema
 */
export type ValidityInfo = z.output<typeof validityInfoSchema>;

/**
 * Factory function for constructing a ValidityInfo map.
 *
 * @description
 * This utility creates a ValidityInfo map instance (enforcing the MSO validity info schema structure),
 * ensuring only the allowed keys (`signed`, `validFrom`, `validUntil`, and optional `expectedUpdate`)
 * are present, and their values are valid CBOR Tag(0) date-time objects.
 *
 * @see validityInfoEntries
 * @see ValidityInfo
 */
export const createValidityInfo = createStrictMap<typeof validityInfoEntries>;
