import { z } from 'zod';
import {
  bytesSchema,
  DataElementIdentifier,
  dataElementIdentifierSchema,
  DataElementValue,
  dataElementValueSchema,
} from '../common';

/**
 * Schema for issuer-signed items in mdoc
 * @description
 * Represents a single issuer-signed data element with its identifier, value, and metadata.
 * This schema validates the structure of issuer-signed items including digest ID, random value,
 * element identifier, and element value.
 *
 * @example
 * ```typescript
 * const item = {
 *   digestID: 1,
 *   random: Buffer.from([]),
 *   elementIdentifier: "given_name",
 *   elementValue: "John"
 * };
 * const result = issuerSignedItemSchema.parse(item); // Returns IssuerSignedItem
 * ```
 */
export const issuerSignedItemSchema = z.object({
  digestID: z.number().int().positive(),
  random: bytesSchema,
  elementIdentifier: dataElementIdentifierSchema,
  elementValue: dataElementValueSchema,
});

/**
 * Type definition for issuer-signed items
 * @description
 * Represents a validated issuer-signed item structure
 *
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
