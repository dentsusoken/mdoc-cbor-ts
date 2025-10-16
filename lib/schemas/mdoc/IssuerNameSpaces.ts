import { z } from 'zod';
import { nameSpaceSchema } from '@/schemas/common/NameSpace';
import { issuerSignedItemBytesSchema } from './IssuerSignedItemBytes';
import { createMapSchema } from '@/schemas/common/container/Map';
import { createArraySchema } from '@/schemas/common/container/Array';

/**
 * Schema for issuer-signed namespaces in mdoc
 * @description
 * Validates a mapping from `NameSpace` to an array of CBOR-encoded issuer-signed items
 * (`IssuerSignedItemBytes`). Each value in the array is a Tag 24 wrapping a CBOR bstr
 * of an `IssuerSignedItem`.
 *
 * ```cddl
 * IssuerNameSpaces = {+ NameSpace => [+ IssuerSignedItemBytes]}
 * IssuerSignedItemBytes = #6.24(bstr .cbor IssuerSignedItem)
 * ```
 *
 * @example
 * ```typescript
 * import { createTag24 } from 'mdoc-cbor-ts';
 *
 * // Example with a single namespace containing one IssuerSignedItemBytes (Tag 24)
 * const tag24 = createTag24(new Uint8Array([]));
 * const input = new Map<string, unknown>([[
 *   'org.iso.18013.5.1',
 *   [tag24],
 * ]]);
 *
 * const result = issuerNameSpacesSchema.parse(input); // Returns IssuerNameSpaces
 * ```
 *
 * @see {@link NameSpace}
 * @see {@link IssuerSignedItemBytes}
 */
export const issuerNameSpacesSchema = createMapSchema({
  target: 'IssuerNameSpaces',
  keySchema: nameSpaceSchema,
  valueSchema: createArraySchema({
    target: 'IssuerSignedItemBytesArray',
    itemSchema: issuerSignedItemBytesSchema,
  }),
});

/**
 * Type definition for issuer-signed namespaces
 * @description
 * Represents a validated record of namespaces and their issuer-signed items
 *
 * @see {@link NameSpace}
 * @see {@link IssuerSignedItemBytes}
 */
export type IssuerNameSpaces = z.output<typeof issuerNameSpacesSchema>;
