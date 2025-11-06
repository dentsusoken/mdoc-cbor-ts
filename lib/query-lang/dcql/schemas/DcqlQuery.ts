import { dcqlCredentialSchema } from './DcqlCredential';
import { z } from 'zod';
import { dcqlCredentialSetSchema } from './DcqlCredentialSet';

/**
 * Complete DCQL query structure for mdoc.
 */
export const dcqlQuerySchema = z.object({
  credentials: z.array(dcqlCredentialSchema).min(1),
  credential_sets: z.array(dcqlCredentialSetSchema).min(1).optional(),
});

/**
 * Type inferred from {@link dcqlQuerySchema} representing a DCQL query.
 */
export type DcqlQuery = z.output<typeof dcqlQuerySchema>;
