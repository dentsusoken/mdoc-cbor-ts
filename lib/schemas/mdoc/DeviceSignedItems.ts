import { z } from 'zod';
import {
  DataElementIdentifier,
  dataElementIdentifierSchema,
  DataElementValue,
  dataElementValueSchema,
  Entry,
} from '../common';

/**
 * Schema for device-signed items in mdoc
 * @description
 * Represents a record of data element identifiers and their corresponding values
 * that are signed by the device. This schema validates that each identifier maps
 * to a valid data element value.
 *
 * @example
 * ```typescript
 * const items = {
 *   "given_name": "John",
 *   "family_name": "Doe"
 * };
 * const result = deviceSignedItemsSchema.parse(items); // Returns DeviceSignedItems
 * ```
 */
export const deviceSignedItemsSchema = z.record(
  dataElementIdentifierSchema,
  dataElementValueSchema
);

/**
 * Type definition for device-signed items
 * @description
 * Represents a validated record of data element identifiers and their values
 *
 * ```cddl
 * DeviceSignedItems = {+ DataElementIdentifier => DataElementValue}
 * ```
 * @see {@link DataElementIdentifier}
 * @see {@link DataElementValue}
 */
export type DeviceSignedItems = z.infer<typeof deviceSignedItemsSchema>;

/**
 * Type definition for device-signed items entries
 * @description
 * Represents a key-value pair from the device-signed items record
 */
export type DeviceSignedItemsEntry = Entry<DeviceSignedItems>;
