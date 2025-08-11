import { TypedMap } from '@jfromaniello/typedmap';
import { z } from 'zod';
import { ByteString } from '@/cbor/ByteString';
import { issuerSignedItemSchema } from './IssuerSignedItem';

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
 * const item = {
 *   digestID: 1,
 *   random: new Uint8Array([]),
 *   elementIdentifier: 'given_name',
 *   elementValue: 'John'
 * };
 * const itemKV = new TypedMap([
 *   ['digestID', item.digestID],
 *   ['random', item.random],
 *   ['elementIdentifier', item.elementIdentifier],
 *   ['elementValue', item.elementValue]
 * ]);
 * const bytes = new ByteString(itemKV);
 * const result = issuerSignedItemBytesSchema.parse(bytes); // Returns ByteString
 * ```
 */
export const issuerSignedItemBytesSchema = z
  .instanceof(ByteString<TypedMap<[string, unknown]>>, {
    message:
      'IssuerSignedItemBytes: Expected a ByteString instance containing issuer-signed item. Please provide a valid CBOR-encoded issuer-signed item.',
  })
  .refine((v) => issuerSignedItemSchema.parse(Object.fromEntries(v.data)));

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
