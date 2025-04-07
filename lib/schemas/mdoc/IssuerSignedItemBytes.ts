import { TypedMap } from '@jfromaniello/typedmap';
import { z } from 'zod';
import { ByteString } from '../../cbor';
import { KVMap } from '../../types';
import { IssuerSignedItem, issuerSignedItemSchema } from './IssuerSignedItem';

/**
 * Schema for CBOR-encoded issuer-signed items
 * @description
 * Represents issuer-signed items encoded as a CBOR tag.
 * This schema validates that the data is a valid CBOR tag containing issuer-signed items.
 *
 * @example
 * ```typescript
 * const bytes = new Tag(24, Buffer.from([]));
 * const result = issuerSignedItemBytesSchema.parse(bytes); // Returns Tag
 * ```
 */
export const issuerSignedItemBytesSchema = z
  .instanceof(ByteString<TypedMap<KVMap<IssuerSignedItem>>>)
  .refine((v) => issuerSignedItemSchema.parse(Object.fromEntries(v.data)));

/**
 * Type definition for CBOR-encoded issuer-signed items
 * @description
 * Represents validated CBOR-encoded issuer-signed items
 *
 * ```cddl
 * IssuerSignedItemBytes = #6.24(bstr .cbor IssuerSignedItem)
 * ```
 * @see {@link IssuerSignedItem}
 */
export type IssuerSignedItemBytes = z.infer<typeof issuerSignedItemBytesSchema>;
