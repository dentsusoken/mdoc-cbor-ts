import { z } from 'zod';
import { dataElementIdentifierSchema } from '../common/DataElementIdentifier';
import { dataElementValueSchema } from '../common/DataElementValue';
import type { Entry } from '../common/Entry';

export const DEVICE_SIGNED_ITEMS_INVALID_TYPE_MESSAGE =
  'DeviceSignedItems: Expected a Map with data element identifiers as keys and valid data element values. Please provide a valid device-signed items mapping.';

export const DEVICE_SIGNED_ITEMS_REQUIRED_MESSAGE =
  'DeviceSignedItems: This field is required. Please provide a device-signed items Map.';

export const DEVICE_SIGNED_ITEMS_EMPTY_MESSAGE =
  'DeviceSignedItems: At least one data element must be provided. The Map cannot be empty.';

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
 * const items = new Map<string, unknown>([
 *   ['given_name', 'John'],
 *   ['family_name', 'Doe']
 * ]);
 * const result = deviceSignedItemsSchema.parse(items); // Returns Map<string, unknown>
 * ```
 */
export const deviceSignedItemsSchema = z
  .map(dataElementIdentifierSchema, dataElementValueSchema, {
    invalid_type_error: DEVICE_SIGNED_ITEMS_INVALID_TYPE_MESSAGE,
    required_error: DEVICE_SIGNED_ITEMS_REQUIRED_MESSAGE,
  })
  .refine(
    (data) => {
      return data.size > 0;
    },
    {
      message: DEVICE_SIGNED_ITEMS_EMPTY_MESSAGE,
    }
  );

// constants are declared above

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
export type DeviceSignedItems = z.output<typeof deviceSignedItemsSchema>;

/**
 * Type definition for device-signed items entries
 * @description
 * Represents a key-value pair from the device-signed items record
 */
export type DeviceSignedItemsEntry = Entry<DeviceSignedItems>;
