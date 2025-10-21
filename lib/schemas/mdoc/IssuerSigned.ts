import { z } from 'zod';
import { createStrictMapSchema } from '@/schemas/containers/StrictMap';
import { issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { issuerNameSpacesSchema } from '@/schemas/mdoc/IssuerNameSpaces';

/**
 * Entries definition for the IssuerSigned schema in mdoc.
 * @description
 * Specifies the required fields and their respective schemas for issuer-signed data.
 * This definition is consumed by {@link createStrictMapSchema} to perform validation and
 * type inference for issuer-signed Map inputs.
 *
 * Structure:
 * - "nameSpaces": Validated by {@link issuerNameSpacesSchema}, mapping namespace strings
 *   to arrays of issuer-signed item bytes.
 * - "issuerAuth": Validated by {@link issuerAuthSchema}, containing issuer authentication
 *   block with the protected header, unprotected header, payload, and signature.
 *
 * ```cddl
 * IssuerSigned = {
 *   "nameSpaces": IssuerNameSpaces,
 *   "issuerAuth": IssuerAuth
 * }
 * ```
 *
 * @see {@link issuerNameSpacesSchema}
 * @see {@link issuerAuthSchema}
 */
export const issuerSignedEntries = [
  ['nameSpaces', issuerNameSpacesSchema],
  ['issuerAuth', issuerAuthSchema],
] as const;

/**
 * Zod schema for issuer-signed data in mdoc.
 * @description
 * Validates the issuer-signed section of a mobile document (mdoc), ensuring that
 * the structure contains correctly-formed namespaces and issuer authentication data.
 *
 * The schema enforces that:
 * - The object is a `Map` with exactly two required entries:
 *   - `"nameSpaces"`: A non-empty `Map` where each key is a non-empty string (the namespace),
 *     and each value is a non-empty array of CBOR Tag 24 objects
 *     (representing CBOR-encoded `IssuerSignedItem` entries).
 *   - `"issuerAuth"`: A `Map` describing the cryptographic issuer authentication container.
 *
 * ```cddl
 * IssuerSigned = {
 *   "nameSpaces": IssuerNameSpaces,
 *   "issuerAuth": IssuerAuth
 * }
 * ```
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
 *         ['elementValue', 'John'],
 *       ])),
 *     ]],
 *   ])],
 *   ['issuerAuth', new Map([
 *     ['protected', new Uint8Array([])],
 *     ['unprotected', new Map()],
 *     ['payload', new Uint8Array([])],
 *     ['signature', new Uint8Array([])],
 *   ])],
 * ]);
 * const result = issuerSignedSchema.parse(issuerSigned); // Returns IssuerSigned
 * ```
 *
 * @see {@link issuerNameSpacesSchema}
 * @see {@link issuerAuthSchema}
 * @see {@link IssuerNameSpaces}
 * @see {@link IssuerAuth}
 */
export const issuerSignedSchema = createStrictMapSchema({
  target: 'IssuerSigned',
  entries: issuerSignedEntries,
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
