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
