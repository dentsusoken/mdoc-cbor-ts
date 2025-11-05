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
   * Optional array of claim constraints.
   * If omitted, all claims from the credential may be returned.
   *
   * **Handling optional fields from Presentation Exchange:**
   * When converting from PEx to DCQL, include ALL claims (both required and optional)
   * in this array. The Wallet will naturally return only claims that exist in the
   * credential. The Verifier should then validate based on the original PEx `optional`
   * flags to determine if missing claims are acceptable.
   *
   * This approach avoids the `claim_sets` combinatorial explosion problem while
   * maintaining flexibility for optional fields.
   */
  claims: z.array(dcqlClaimSchema).optional(),

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
