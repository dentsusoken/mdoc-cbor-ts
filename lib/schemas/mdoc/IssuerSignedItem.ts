import { z } from 'zod';
import { bytesSchema } from '@/schemas/common/Bytes';
import { dataElementIdentifierSchema } from '@/schemas/common/DataElementIdentifier';
import { dataElementValueSchema } from '@/schemas/common/DataElementValue';

/**
 * Schema for issuer-signed items in mdoc
 * @description
 * Represents a single issuer-signed data element with its identifier, value, and metadata.
 * This schema validates the structure of issuer-signed items including digest ID, random value,
 * element identifier, and element value.
 *
 * ```cddl
 * IssuerSignedItem = {
 *  "digestID": uint,
 *  "random": bstr,
 *  "elementIdentifier": DataElementIdentifier,
 *  "elementValue": DataElementValue
 * }
 * ```
 *
 * @example
 * ```typescript
 * const item = {
 *   digestID: 1,
 *   random: new Uint8Array([]),
 *   elementIdentifier: "given_name",
 *   elementValue: "John"
 * };
 * const result = issuerSignedItemSchema.parse(item); // Returns IssuerSignedItem
 * ```
 */
export const issuerSignedItemSchema = z.object(
  {
    digestID: z
      .number({
        invalid_type_error:
          'IssuerSignedItem.digestID: Expected a non-negative integer number.',
        required_error:
          'IssuerSignedItem.digestID: This field is required. Please provide a non-negative integer number.',
      })
      .int({
        message: 'IssuerSignedItem.digestID: Expected an integer number.',
      })
      .min(0, {
        message:
          'IssuerSignedItem.digestID: Must be greater than or equal to 0.',
      }),
    random: bytesSchema,
    elementIdentifier: dataElementIdentifierSchema,
    elementValue: dataElementValueSchema,
  },
  {
    invalid_type_error:
      'IssuerSignedItem: Expected an object with fields "digestID", "random", "elementIdentifier", "elementValue". Please provide a valid issuer-signed item object.',
    required_error:
      'IssuerSignedItem: This field is required. Please provide an issuer-signed item object.',
  }
);

/**
 * Type definition for issuer-signed items
 * @description
 * Represents a validated issuer-signed item structure
 *
 * @see {@link DataElementIdentifier}
 * @see {@link DataElementValue}
 */
export type IssuerSignedItem = z.output<typeof issuerSignedItemSchema>;
