import { z } from 'zod';
import { dcqlClaimSchema } from './DcqlClaim';
import { dcqlMetaSchema } from './DcqlMeta';
import { dcqlClaimSetSchema } from './DcqlClaimSet';

/**
 * DCQL credential query for mso_mdoc format.
 */
export const dcqlCredentialSchema = z.object({
  /**
   * Unique identifier for this credential query.
   */
  id: z.string(),

  /**
   * REQUIRED: Must be "mso_mdoc" for mdoc format.
   */
  format: z.literal('mso_mdoc'),

  /**
   * REQUIRED: mdoc-specific metadata containing doctype_value.
   */
  meta: dcqlMetaSchema,

  /**
   * Optional: Array of claim constraints for this credential query.
   * If specified, must contain at least one claim.
   * Each claim describes a claim path and optional values/intents.
   */
  claims: z.array(dcqlClaimSchema).min(1).optional(),

  /**
   * Optional: Array of claim sets, each designating one or more claims to be proven together.
   * If specified, must not be empty, and each entry must be a non-empty array of claim path strings.
   */
  claim_sets: z.array(dcqlClaimSetSchema).min(1).optional(),

  /**
   * Indicates whether multiple credentials may be returned.
   * Defaults to false (single credential).
   */
  multiple: z.boolean().default(false),
});

/**
 * Type inferred from {@link dcqlCredentialSchema} representing a DCQL credential.
 */
export type DcqlCredential = z.output<typeof dcqlCredentialSchema>;
