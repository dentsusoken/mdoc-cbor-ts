import { dcqlCredentialSchema } from './DcqlCredential';
import { z } from 'zod';
import { dcqlCredentialSetSchema } from './DcqlCredentialSet';

/**
 * Complete DCQL query structure for mdoc.
 */
export const dcqlQuerySchema = z
  .object({
    credentials: z.array(dcqlCredentialSchema).min(1),
    credential_sets: z.array(dcqlCredentialSetSchema).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.credential_sets) {
      return;
    }

    // Collect all credential IDs from the credentials array
    const credentialIds = new Set(data.credentials.map((cred) => cred.id));

    // Validate each credential set
    data.credential_sets.forEach((credentialSet, setIndex) => {
      // Validate each option in the credential set
      credentialSet.options.forEach((option, optionIndex) => {
        // Validate each credential ID in the option
        option.forEach((credentialId, idIndex) => {
          if (!credentialIds.has(credentialId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Credential ID "${credentialId}" referenced in credential_sets[${setIndex}].options[${optionIndex}][${idIndex}] does not exist in credentials array`,
              path: [
                'credential_sets',
                setIndex,
                'options',
                optionIndex,
                idIndex,
              ],
            });
          }
        });
      });
    });
  });

/**
 * Type inferred from {@link dcqlQuerySchema} representing a DCQL query.
 */
export type DcqlQuery = z.output<typeof dcqlQuerySchema>;
