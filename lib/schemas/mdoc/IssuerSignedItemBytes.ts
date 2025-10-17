import { z } from 'zod';
import { createTag24Schema } from '@/schemas/cbor/EmbeddedCbor';

/**
 * Schema for CBOR-encoded issuer-signed items
 * @description
 * Represents issuer-signed items encoded as a CBOR tag.
 * This schema validates that the data is a valid CBOR tag containing issuer-signed items.
 *
 * ```cddl
 * IssuerSignedItemBytes = #6.24(bstr .cbor IssuerSignedItem)
 * ```
 *
 * @example
 * ```typescript
 * import { Tag } from 'cbor-x';
 *
 * // CBOR-encoded issuer-signed item as a Tag 24
 * const tag = new Tag(encodeCbor(issueSignedItems), 24);
 * const result = issuerSignedItemBytesSchema.parse(tag); // Returns Tag
 * ```
 */
export const issuerSignedItemBytesSchema = createTag24Schema(
  'IssuerSignedItemBytes'
);

/**
 * Type definition for CBOR-encoded issuer-signed items
 * @description
 * Represents validated CBOR-encoded issuer-signed items
 *
 * @see {@link IssuerSignedItem}
 */
export type IssuerSignedItemBytes = z.output<
  typeof issuerSignedItemBytesSchema
>;
