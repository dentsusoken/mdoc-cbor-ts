import { Sign1 } from '@auth0/cose';
import { z } from 'zod';

// TODO: おそらくこれだとProtectedHeaders, UnprotectedHeadersがうまくいかない
export const issuerAuthSchema = z.custom<Sign1>().transform((sign1) => {
  const { protectedHeaders, unprotectedHeaders, payload, signature } = sign1;
  return new Sign1(protectedHeaders, unprotectedHeaders, payload, signature);
});

/**
 * ```cddl
 * IssuerAuth = COSE_Sign1
 * ```
 * @see {@link Sign1}
 */
export type IssuerAuth = z.infer<typeof issuerAuthSchema>;
