import { dcqlValueSchema } from './DcqlValue';
import { z } from 'zod';

/**
 * Zod schema for a single DCQL claim constraint.
 *
 * This schema defines the structure for a DCQL claim:
 * - 'id': Optional. A unique identifier for this claim. Must be a non-empty string.
 * - 'path': Tuple with [namespace, claim_name] (both non-empty strings).
 * - 'values': Optional array of permitted DCQL values (string, number, boolean, or null).
 * - 'intent_to_retain': Optional boolean indicating if the Verifier intends to retain the claim value. Defaults to false.
 *
 * @see https://openid.net/specs/openid-4-verifiable-presentations-1_0.html
 *
 * The 'id' element has been added.
 */
export const dcqlClaimSchema = z.object({
  id: z.string().min(1).optional(),
  path: z.tuple([z.string(), z.string()]),
  values: z.array(dcqlValueSchema).optional(),
  intent_to_retain: z.boolean().default(false),
});

/**
 * Type inferred from {@link dcqlClaimSchema} representing a DCQL claim.
 */
export type DcqlClaim = z.output<typeof dcqlClaimSchema>;
