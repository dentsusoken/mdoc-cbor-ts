import { z } from 'zod';
import { createDateTimeSchema } from '@/schemas/common/DateTime';
import { createStructSchema } from '../common/Struct';

export const validityInfoObjectSchema = z.object({
  signed: createDateTimeSchema('Signed'),
  validFrom: createDateTimeSchema('ValidFrom'),
  validUntil: createDateTimeSchema('ValidUntil'),
  expectedUpdate: createDateTimeSchema('ExpectedUpdate').optional(),
});

/**
 * Schema for validity information in MSO
 * @description
 * Validates a `Map<string, unknown>` (e.g., CBOR-decoded) that is transformed into
 * a plain object and checked against `validityInfoObjectSchema`.
 * Each date-time field is validated using `createDateTimeSchema` (see `schemas/common/DateTime.ts`).
 * The preferred input is an ISO 8601 date-time string; it will be normalized to
 * `YYYY-MM-DDTHH:MM:SSZ`. `Tag0` inputs are also accepted but are not the default.
 *
 * Container errors are prefixed with `ValidityInfo: ...` by `createStructSchema`.
 * Field-level validation is delegated to `createDateTimeSchema` (see `DateTime.ts` for details).
 *
 * Fields:
 * - `signed`: ISO string (preferred) or Tag0 (normalized) (required)
 * - `validFrom`: ISO string (preferred) or Tag0 (normalized) (required)
 * - `validUntil`: ISO string (preferred) or Tag0 (normalized) (required)
 * - `expectedUpdate`: ISO string (preferred) or Tag0 (normalized) (optional)
 *
 * ```cddl
 * ValidityInfo = {
 *  "signed": tdate,
 *  "validFrom": tdate,
 *  "validUntil": tdate,
 *  ? "expectedUpdate": tdate
 * }
 * ```
 *
 * @example
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
 * // result fields are normalized strings: 'YYYY-MM-DDTHH:MM:SSZ'
 * ```
 */
export const validityInfoSchema = createStructSchema({
  target: 'ValidityInfo',
  objectSchema: validityInfoObjectSchema,
});

/**
 * Type definition for validity information
 * @description
 * Represents a validated validity information structure where all date-time
 * fields are normalized ISO strings (`YYYY-MM-DDTHH:MM:SSZ`) as produced by
 * `createDateTimeSchema` (see `schemas/common/DateTime.ts`).
 */
export type ValidityInfo = z.output<typeof validityInfoSchema>;
