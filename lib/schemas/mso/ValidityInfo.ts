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
 * Validates the structure and field types for validity information.
 * Each date-time field is validated using `createDateTimeSchema`, which expects
 * a `DateTime` instance (created via CBOR decoding of tag 0), and rejects
 * invalid dates (where `toISOString()` would throw a RangeError).
 *
 * Fields:
 * - `signed`: DateTime (required)
 * - `validFrom`: DateTime (required)
 * - `validUntil`: DateTime (required)
 * - `expectedUpdate`: DateTime (optional)
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
 * import { DateTime } from '@/cbor/DateTime';
 * import { validityInfoSchema } from '@/schemas/mso/ValidityInfo';
 *
 * const info = {
 *   signed: new DateTime('2024-03-20T10:00:00Z'),
 *   validFrom: new DateTime('2024-03-20T10:00:00Z'),
 *   validUntil: new DateTime('2025-03-20T10:00:00Z'),
 *   expectedUpdate: new DateTime('2024-09-20T10:00:00Z'),
 * };
 *
 * const result = validityInfoSchema.parse(info);
 * // result is a validated structure with DateTime instances
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
 * fields are `DateTime` instances (validated via `createDateTimeSchema`).
 */
export type ValidityInfo = z.output<typeof validityInfoSchema>;
