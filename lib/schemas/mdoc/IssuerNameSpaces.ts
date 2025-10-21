import { z } from 'zod';
import { embeddedCborSchema } from '@/schemas/cbor/EmbeddedCbor';
import { createMapSchema } from '@/schemas/containers/Map';
import { createArraySchema } from '@/schemas/containers/Array';

/**
 * Schema for issuer-signed namespaces in mdoc.
 *
 * Validates a required non-empty `Map<NameSpace, Array<IssuerSignedItemBytes>>`, where:
 * - The key (NameSpace) is a non-empty string.
 * - The value is a non-empty array of embedded CBOR Tag 24 objects, each representing
 *   an `IssuerSignedItem` encoded as CBOR bytes and wrapped by CBOR tag 24.
 *
 * > NOTE: There is currently no exported `nameSpaceSchema` or `issuerSignedItemBytesSchema`;
 * > their structure is enforced inline using Zod by validating the key as a non-empty string
 * > and the value as a non-empty array of the embeddedCborSchema (which enforces Tag 24).
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
 * const tag24 = createTag24(new Uint8Array([])); // Tag 24 instance wrapping CBOR bytes
 * const input = new Map<string, unknown>([
 *   ['org.iso.18013.5.1', [tag24]],
 * ]);
 *
 * // Validates that input matches the expected structure.
 * const result = issuerNameSpacesSchema.parse(input); // Returns IssuerNameSpaces
 * ```
 */
export const issuerNameSpacesSchema = createMapSchema({
  target: 'IssuerNameSpaces',
  keySchema: z.string().min(1), // NameSpace (non-empty string)
  valueSchema: createArraySchema({
    target: 'IssuerSignedItemBytesArray',
    itemSchema: embeddedCborSchema, // CBOR Tag 24 instance
    nonempty: true,
  }),
  nonempty: true,
});

/**
 * Type representing validated issuer-signed namespaces.
 * The type is a Map from NameSpace (non-empty string) to a non-empty array of embedded CBOR Tag 24 objects.
 */
export type IssuerNameSpaces = z.output<typeof issuerNameSpacesSchema>;
