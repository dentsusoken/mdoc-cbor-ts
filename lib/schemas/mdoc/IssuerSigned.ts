import { z } from 'zod';
import { createStructSchema } from '@/schemas/common/Struct';
import { issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { issuerNameSpacesSchema } from '@/schemas/mdoc/IssuerNameSpaces';

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
 * - nameSpaces: {@link IssuerNameSpaces} - Mapping of namespaces to issuer-signed items
 * - issuerAuth: {@link IssuerAuth} - Issuer authentication data
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
 * import { createTag24 } from '@/cbor/createTag24';
 *
 * const issuerSigned = new Map([
 *   ['nameSpaces', new Map([
 *     ['org.iso.18013.5.1', [
 *       createTag24(new Map([
 *         ['digestID', 1],
 *         ['random', new Uint8Array([])],
 *         ['elementIdentifier', 'given_name'],
 *         ['elementValue', 'John']
 *       ]))
 *     ]]
 *   ])],
 *   ['issuerAuth', new Map([
 *     ['protected', new Uint8Array([])],
 *     ['unprotected', new Map()],
 *     ['payload', new Uint8Array([])],
 *     ['signature', new Uint8Array([])]
 *   ])]
 * ]);
 * const result = issuerSignedSchema.parse(issuerSigned); // Returns IssuerSigned
 * ```
 *
 * @see {@link IssuerNameSpaces}
 * @see {@link IssuerAuth}
 * @see {@link issuerSignedObjectSchema}
 */
export const issuerSignedSchema = createStructSchema({
  target: 'IssuerSigned',
  objectSchema: issuerSignedObjectSchema,
});

/**
 * Type definition for issuer-signed data
 * @description
 * Represents a validated issuer-signed data structure containing namespaces and authentication
 *
 * @see {@link IssuerNameSpaces}
 * @see {@link IssuerAuth}
 */
export type IssuerSigned = z.output<typeof issuerSignedSchema>;
