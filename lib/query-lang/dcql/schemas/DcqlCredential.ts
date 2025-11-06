import { z } from 'zod';
import { dcqlClaimSchema } from './DcqlClaim';
import { dcqlMetaSchema } from './DcqlMeta';

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
   * Optional, but if present must be a non-empty array of claim constraints.
   * If omitted, all claims from the credential may be returned.
   *
   * When converting from Presentation Exchange (PEx) to DCQL, include ALL claims
   * (both required and optional) in this array. The Wallet will only return claims
   * actually present in the credential, and the Verifier should apply the
   * original PEx `optional` flags to validate acceptability of missing claims.
   *
   * Note: `.min(1)` is enforced so if `claims` is present, it must be a non-empty array.
   * This helps avoid edge cases and aligns with expected query logic.
   *
   * This approach avoids the combinatorial explosion of `claim_sets` while
   * maintaining flexibility for optional fields.
   */
  claims: z.array(dcqlClaimSchema).min(1).optional(),

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
