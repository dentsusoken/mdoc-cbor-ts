import { Sign1 } from '@auth0/cose';
import { z } from 'zod';
import { numberMapSchema } from '../common';

/**
 * Schema for issuer authentication in MSO
 * @description
 * Represents a COSE_Sign1 signature created by the issuer.
 * This schema validates and transforms COSE_Sign1 objects while preserving their structure.
 *
 * @example
 * ```typescript
 * const sign1 = [protectedHeaders, unprotectedHeaders, payload, signature];
 * const result = issuerAuthSchema.parse(sign1); // Returns Sign1
 * ```
 */
export const issuerAuthSchema = z.tuple([
  z.union([z.instanceof(Uint8Array), numberMapSchema]),
  numberMapSchema,
  z.instanceof(Uint8Array),
  z.instanceof(Uint8Array),
]); // TODO
// .transform((sign1) => {
//   const [protectedHeaders, unprotectedHeaders, payload, signature] = sign1;
//   const unprotectedHeadersMap = numberMap.parse(unprotectedHeaders);
//   return new Sign1(protectedHeaders, unprotectedHeadersMap, payload, signature);
// });

/**
 * Type definition for issuer authentication
 * @description
 * Represents a validated COSE_Sign1 signature from the issuer
 *
 * ```cddl
 * IssuerAuth = COSE_Sign1
 * ```
 * @see {@link Sign1}
 */
export type IssuerAuth = z.infer<typeof issuerAuthSchema>;
