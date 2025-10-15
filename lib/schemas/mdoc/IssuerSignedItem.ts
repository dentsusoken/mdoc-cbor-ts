import { z } from 'zod';
import { createBytesSchema } from '@/schemas/common/Bytes';
import { dataElementIdentifierSchema } from '@/schemas/common/DataElementIdentifier';
import { dataElementValueSchema } from '@/schemas/common/DataElementValue';
import { digestIDSchema } from '@/index';
import { createStructSchema } from '../common/Struct';
import { createStrictMapSchema } from '../common/StrictMap';

/**
 * Object schema for issuer-signed items in mdoc
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
 * Properties:
 * - digestID: {@link DigestID} - Unique identifier for the digest
 * - random: Byte string containing random data
 * - elementIdentifier: {@link DataElementIdentifier} - Identifier for the data element
 * - elementValue: {@link DataElementValue} - The actual data element value
 */
export const issuerSignedItemEntries = [
  ['digestID', digestIDSchema],
  ['random', createBytesSchema('random')],
  ['elementIdentifier', dataElementIdentifierSchema],
  ['elementValue', dataElementValueSchema],
] as const;

/**
 * Schema for issuer-signed items in mdoc
 * @description
 * Represents a single issuer-signed data element that has been signed by the issuer.
 * This schema accepts a Map input and transforms it to a plain object for validation.
 * The schema validates the structure of issuer-signed items including digest ID, random value,
 * element identifier, and element value.
 *
 * @example
 * ```typescript
 * const item = new Map([
 *   ['digestID', 1],
 *   ['random', new Uint8Array([1, 2, 3])],
 *   ['elementIdentifier', 'given_name'],
 *   ['elementValue', 'John']
 * ]);
 * const result = issuerSignedItemSchema.parse(item); // Returns IssuerSignedItem
 * ```
 *
 * @see {@link DigestID}
 * @see {@link DataElementIdentifier}
 * @see {@link DataElementValue}
 * @see {@link issuerSignedItemObjectSchema}
 */
export const issuerSignedItemSchema = createStrictMapSchema({
  target: 'IssuerSignedItem',
  entries: issuerSignedItemEntries,
});

/**
 * Type definition for issuer-signed items
 * @description
 * Represents a validated issuer-signed item structure
 *
 * @see {@link DataElementIdentifier}
 * @see {@link DataElementValue}
 */
export type IssuerSignedItem = z.output<typeof issuerSignedItemSchema>;
