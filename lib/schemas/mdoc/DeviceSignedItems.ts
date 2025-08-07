import { z } from 'zod';
import { dataElementIdentifierSchema } from '../common/DataElementIdentifier';
import { dataElementValueSchema } from '../common/DataElementValue';
import type { Entry } from '../common/Entry';

/**
 * Schema for device-signed items in mdoc
 * @description
 * Represents a record of data element identifiers and their corresponding values
 * that are signed by the device. This schema validates that each identifier maps
 * to a valid data element value.
 *
 * ```cddl
 * DeviceSignedItems = {
 *   + DataElementIdentifier => DataElementValue
 * }
 * ```
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
export const deviceSignedItemsSchema = z
  .record(dataElementIdentifierSchema, dataElementValueSchema, {
    invalid_type_error:
      'DeviceSignedItems: Expected an object with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.',
    required_error:
      'DeviceSignedItems: This field is required. Please provide a device-signed items mapping object.',
  })
  .refine(
    (data) => {
      return Object.keys(data).length > 0;
    },
    {
      message:
        'DeviceSignedItems: At least one data element must be provided. The object cannot be empty.',
    }
  );

/**
 * Type definition for device-signed items
 * @description
 * Represents a validated record of data element identifiers and their values
 * that are signed by the device. This follows the ISO/IEC 18013-5 standard
 * for device-signed data elements.
 *
 * ```cddl
 * DeviceSignedItems = {
 *   + DataElementIdentifier => DataElementValue
 * }
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
