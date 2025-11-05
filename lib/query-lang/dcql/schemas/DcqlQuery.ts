import { dcqlCredentialSchema } from './DcqlCredential';
import { z } from 'zod';

/**
 * Complete DCQL query structure for mdoc.
 */
export const dcqlQuerySchema = z.object({
  credentials: z.array(dcqlCredentialSchema).min(1),
});

/**
 * Type inferred from {@link dcqlQuerySchema} representing a DCQL query.
 */
export type DcqlQuery = z.output<typeof dcqlQuerySchema>;
