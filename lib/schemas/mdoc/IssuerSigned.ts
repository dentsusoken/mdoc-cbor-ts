import { z } from 'zod';
import { issuerAuthSchema } from '../mso';
import { issuerNameSpacesSchema } from './IssuerNameSpaces';

/**
 * Object schema for issuer-signed data validation
 * @description
 * Validates that an issuer-signed object has the required properties and types.
 * This object schema is used internally by {@link issuerSignedSchema} after transforming
 * the input Map into a plain object.
 *
 * ```cddl
 * IssuerSigned = {
 *  "nameSpaces": IssuerNameSpaces,
 *  "issuerAuth": IssuerAuth
 * }
 * ```
 *
 * Properties:
 * - nameSpaces: {@link IssuerNameSpaces}
 * - issuerAuth: {@link IssuerAuth}
 */
export const issuerSignedObjectSchema = z.object({
  nameSpaces: issuerNameSpacesSchema,
  issuerAuth: issuerAuthSchema,
});

/**
 * Schema for issuer-signed data in mdoc
 * @description
 * Represents the portion of the mdoc that is signed by the issuer.
 * This schema validates the structure of issuer-signed data including namespaces and authentication.
 * The schema accepts a Map input and transforms it to a plain object for validation.
 *
 * @example
 * ```typescript
 * const issuerSigned = new Map([
 *   ['nameSpaces', {}],
 *   ['issuerAuth', new Map()]
 * ]);
 * const result = issuerSignedSchema.parse(issuerSigned); // Returns IssuerSigned
 * ```
 *
 * @see {@link issuerSignedObjectSchema}
 */
export const issuerSignedSchema = z
  .map(z.any(), z.any(), {
    invalid_type_error:
      'IssuerSigned: Expected a Map with keys "nameSpaces" and "issuerAuth". Please provide a valid issuer-signed mapping.',
    required_error:
      'IssuerSigned: This field is required. Please provide an issuer-signed mapping.',
  })
  .transform((v) => issuerSignedObjectSchema.parse(Object.fromEntries(v)));

/**
 * Type definition for issuer-signed data
 * @description
 * Represents validated issuer-signed data structure
 */
export type IssuerSigned = z.output<typeof issuerSignedSchema>;
