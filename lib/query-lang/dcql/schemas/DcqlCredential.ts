import { z } from 'zod';
import { dcqlClaimSchema } from './DcqlClaim';
import { dcqlMetaSchema } from './DcqlMeta';
import { dcqlClaimSetSchema } from './DcqlClaimSet';

/**
 * DCQL credential query for mso_mdoc format.
 */
export const dcqlCredentialSchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    if (!data.claims && data.claim_sets) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'claim_sets MUST NOT be present if claims is absent.',
        path: ['claim_sets'],
      });

      return z.NEVER;
    }

    if (!data.claim_sets || !data.claims) {
      return;
    }

    // Collect all claim IDs from the claims array (only claims with id defined)
    const claimIds = new Set(
      data.claims
        .filter((claim) => claim.id !== undefined)
        .map((claim) => claim.id!)
    );

    let hasError = false;
    data.claim_sets.forEach((claimSet, setIndex) => {
      // Validate each claim ID in the claim set
      claimSet.forEach((claimId, idIndex) => {
        if (!claimIds.has(claimId)) {
          hasError = true;
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Claim ID "${claimId}" referenced in claim_sets[${setIndex}][${idIndex}] does not exist in claims array`,
            path: ['claim_sets', setIndex, idIndex],
          });
        }
      });
    });

    if (hasError) {
      return z.NEVER;
    }
  });

/**
 * Type inferred from {@link dcqlCredentialSchema} representing a DCQL credential.
 */
export type DcqlCredential = z.output<typeof dcqlCredentialSchema>;
