import { z } from 'zod';
import {
  bytesSchema,
  dataElementIdentifierSchema,
  dataElementValueSchema,
  DataElementIdentifier,
  DataElementValue,
} from '../common';

export const issuerSignedItemSchema = z.object({
  digestID: z.number().int().positive(),
  random: bytesSchema,
  elementIdentifier: dataElementIdentifierSchema,
  elementValue: dataElementValueSchema,
});

/**
 * ```cddl
 * IssuerSignedItem = {
 *  "digestID": uint,
 *  "random": bstr,
 *  "elementIdentifier": DataElementIdentifier,
 *  "elementValue": DataElementValue
 * }
 * ```
 * @see {@link DataElementIdentifier}
 * @see {@link DataElementValue}
 */
export type IssuerSignedItem = z.infer<typeof issuerSignedItemSchema>;
