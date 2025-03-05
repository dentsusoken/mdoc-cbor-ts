import { z } from 'zod';
import { Entry, NameSpace, nameSpaceSchema } from '../common';
import {
  IssuerSignedItemBytes,
  issuerSignedItemBytesSchema,
} from './IssuerSignedItemBytes';

/**
 * Schema for issuer-signed namespaces in mdoc
 * @description
 * Represents a record of namespaces and their corresponding issuer-signed items.
 * This schema validates that each namespace maps to an array of valid issuer-signed items.
 *
 * @example
 * ```typescript
 * const namespaces = {
 *   "org.iso.18013.5.1": [new Tag(24, Buffer.from([]))]
 * };
 * const result = issuerNameSpacesSchema.parse(namespaces); // Returns IssuerNameSpaces
 * ```
 */
export const issuerNameSpacesSchema = z.record(
  nameSpaceSchema,
  z.array(issuerSignedItemBytesSchema)
);

/**
 * Type definition for issuer-signed namespaces
 * @description
 * Represents a validated record of namespaces and their issuer-signed items
 *
 * ```cddl
 * IssuerNameSpaces = {+ NameSpace => [+ IssuerSignedItemBytes]}
 * ```
 * @see {@link NameSpace}
 * @see {@link IssuerSignedItemBytes}
 */
export type IssuerNameSpaces = z.infer<typeof issuerNameSpacesSchema>;

/**
 * Type definition for issuer-signed namespace entries
 * @description
 * Represents a key-value pair from the issuer-signed namespaces record
 */
export type IssuerNameSpacesEntry = Entry<IssuerNameSpaces>;
