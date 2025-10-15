import { z } from 'zod';
import { createDateTimeSchema } from '@/schemas/common/DateTime';
import { createStrictMapSchema } from '../common/StrictMap';

/**
 * The canonical struct entries for MSO ValidityInfo, to be used with createStructSchema.
 *
 * @description
 * Defines the validity information fields for a Mobile Security Object (MSO),
 * including required and optional tagged date-time values. Each field expects
 * an ISO 8601 string or CBOR Tag0 date-time representation, normalized to
 * 'YYYY-MM-DDTHH:MM:SSZ'. The array is designed for use with createStructSchema.
 *
 * Fields:
 * - 'signed': The date/time when the MSO was signed (required)
 * - 'validFrom': The date/time when the document becomes valid (required)
 * - 'validUntil': The date/time when the document expires (required)
 * - 'expectedUpdate': The date/time by when the document should be updated (optional)
 *
 * Used by: {@link validityInfoSchema}
 */
export const validityInfoEntries = [
  ['signed', createDateTimeSchema('Signed')],
  ['validFrom', createDateTimeSchema('ValidFrom')],
  ['validUntil', createDateTimeSchema('ValidUntil')],
  ['expectedUpdate', createDateTimeSchema('ExpectedUpdate').optional()],
] as const;

/**
 * Schema for validity information in a Mobile Security Object (MSO)
 * @description
 * Validates a required Map with keys and values corresponding to the fields in MSO ValidityInfo.
 * Primarily designed to accept a `Map<string, unknown>` (such as CBOR-decoded input), enforcing presence and correctness of all required fields.
 *
 * - Each value must be a date-time string in RFC 3339/ISO 8601 format (e.g., `'2024-03-20T10:00:00Z'`)
 *   or a CBOR Tag0 (tdate, per RFC 8949) containing such a string.
 * - Fields are normalized and output as CBOR Tag0 objects (if using the Tag0 path), or checked for format (if using string input).
 * - The schema ensures:
 *   - All required fields are present: `signed`, `validFrom`, `validUntil`.
 *   - An optional field: `expectedUpdate` may also be provided.
 *   - Additional fields are rejected.
 *   - Error messages are prefixed with `ValidityInfo: ...`.
 *   - Field-level validation is delegated to `createDateTimeSchema`, which ensures correct type and strict format.
 *
 * ValidityInfo structure:
 * - `signed`: Required. Date/time when the MSO was signed.
 * - `validFrom`: Required. Date/time when the document becomes valid.
 * - `validUntil`: Required. Date/time when the document expires.
 * - `expectedUpdate`: Optional. Date/time by which the document should be updated.
 *
 * ```cddl
 * ValidityInfo = {
 *   "signed": tdate,
 *   "validFrom": tdate,
 *   "validUntil": tdate,
 *   ? "expectedUpdate": tdate
 * }
 * ```
 *
 * @example Validate a fully-populated ValidityInfo map:
 * ```typescript
 * import { validityInfoSchema } from '@/schemas/mso/ValidityInfo';
 *
 * const input = new Map<string, unknown>([
 *   ['signed', '2024-03-20T10:00:00Z'],
 *   ['validFrom', '2024-03-20T10:00:00Z'],
 *   ['validUntil', '2025-03-20T10:00:00Z'],
 *   ['expectedUpdate', '2024-09-20T10:00:00Z'],
 * ]);
 *
 * const result = validityInfoSchema.parse(input);
 * // result.get('signed'), result.get('validFrom'), etc., are Tag(0) with normalized RFC 3339 strings.
 * ```
 *
 * @example Validate a minimal ValidityInfo map (no expectedUpdate):
 * ```typescript
 * import { validityInfoSchema } from '@/schemas/mso/ValidityInfo';
 *
 * const input = new Map<string, unknown>([
 *   ['signed', '2025-01-01T00:00:00Z'],
 *   ['validFrom', '2025-01-01T00:00:00Z'],
 *   ['validUntil', '2026-01-01T00:00:00Z'],
 * ]);
 *
 * const result = validityInfoSchema.parse(input);
 * // result.has('expectedUpdate') === false
 * ```
 *
 * @see createDateTimeSchema
 * @see validityInfoEntries
 */
export const validityInfoSchema = createStrictMapSchema({
  target: 'ValidityInfo',
  entries: validityInfoEntries,
});

/**
 * Type definition for validity information
 * @description
 * Represents a validated validity information structure where all date-time
 * fields are normalized ISO strings (`YYYY-MM-DDTHH:MM:SSZ`) as produced by
 * `createDateTimeSchema` (see `schemas/common/DateTime.ts`).
 */
export type ValidityInfo = z.output<typeof validityInfoSchema>;
