import { z } from 'zod';

// TODO: z.date() should be CborDateTime
export const validityInfoSchema = z.object({
  signed: z.date(),
  validFrom: z.date(),
  validUntil: z.date(),
  expectedUpdate: z.date().optional(),
});

/**
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
