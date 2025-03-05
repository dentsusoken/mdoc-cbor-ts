import { z } from 'zod';
import { IssuerAuth, issuerAuthSchema } from '../mso';
import { IssuerNameSpaces, issuerNameSpacesSchema } from './IssuerNameSpaces';

/**
 * Schema for issuer-signed data in mdoc
 * @description
 * Represents the portion of the mdoc that is signed by the issuer.
 * This schema validates the structure of issuer-signed data including namespaces and authentication.
 *
 * @example
 * ```typescript
 * const issuerSigned = {
 *   nameSpaces: {},
 *   issuerAuth: {}
 * };
 * const result = issuerSignedSchema.parse(issuerSigned);
 * ```
 */
export const issuerSignedSchema = z.object({
  nameSpaces: issuerNameSpacesSchema,
  issuerAuth: issuerAuthSchema,
});

/**
 * Type definition for issuer-signed data
 * @description
 * Represents validated issuer-signed data structure
 *
 * ```cddl
 * IssuerSigned = {
 *  "nameSpaces": IssuerNameSpaces,
 *  "issuerAuth": IssuerAuth
 * }
 * ```
 * @see {@link IssuerNameSpaces}
 * @see {@link IssuerAuth}
 */
export type IssuerSigned = z.infer<typeof issuerSignedSchema>;
