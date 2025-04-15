import { z } from 'zod';
import { DateTime } from '../../cbor';

// TODO: z.date() should be CborDateTime
/**
 * Schema for validity information in MSO
 * @description
 * Represents the validity period of a mobile security object.
 * This schema validates the structure of validity information including signed date,
 * valid from date, valid until date, and optional expected update date.
 *
 * @example
 * ```typescript
 * const info = {
 *   signed: new Date(),
 *   validFrom: new Date(),
 *   validUntil: new Date(),
 *   expectedUpdate: new Date()
 * };
 * const result = validityInfoSchema.parse(info); // Returns ValidityInfo
 * ```
 */
export const validityInfoSchema = z.map(z.any(), z.any()).transform((data) => {
  return z
    .object({
      signed: z.instanceof(DateTime),
      validFrom: z.instanceof(DateTime),
      validUntil: z.instanceof(DateTime),
      expectedUpdate: z.instanceof(DateTime).optional(),
    })
    .parse(Object.fromEntries(data));
});

/**
 * Type definition for validity information
 * @description
 * Represents a validated validity information structure
 *
 * ```cddl
 * ValidityInfo = {
 *  "signed": tdate,
 *  "validFrom": tdate,
 *  "validUntil": tdate,
 *  ? "expectedUpdate": tdate
 * }
 * ```
 */
export type ValidityInfo = z.infer<typeof validityInfoSchema>;
