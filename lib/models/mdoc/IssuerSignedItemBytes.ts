import { Tag } from 'cbor-x';
import { z } from 'zod';

// export const issuerSignedItemBytesSchema = bytesSchema;
export const issuerSignedItemBytesSchema = z.custom<Tag>();

/**
 * ```cddl
 * IssuerSignedItemBytes = #6.24(bstr .cbor IssuerSignedItem)
 * ```
 * @see {@link IssuerSignedItem}
 */
export type IssuerSignedItemBytes = z.infer<typeof issuerSignedItemBytesSchema>;
