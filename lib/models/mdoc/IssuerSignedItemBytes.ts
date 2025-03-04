import { z } from 'zod';
import { Tag } from 'cbor-x';

// export const issuerSignedItemBytesSchema = bytesSchema;
export const issuerSignedItemBytesSchema = z.custom<Tag>();

/**
 * ```cddl
 * IssuerSignedItemBytes = #6.24(bstr .cbor IssuerSignedItem)
 * ```
 * @see {@link IssuerSignedItem}
 */
export type IssuerSignedItemBytes = z.infer<typeof issuerSignedItemBytesSchema>;
