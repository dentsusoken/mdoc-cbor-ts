import { z } from 'zod';
import { Entry } from '@/schemas/common/Entry';
import { nameSpaceSchema } from '@/schemas/common/NameSpace';
import { deviceSignedItemsSchema } from './DeviceSignedItems';

export const DEVICE_NAMESPACES_INVALID_TYPE_MESSAGE =
  'DeviceNameSpaces: Expected a Map with namespace keys and device-signed items values. Please provide a valid namespace mapping.';

export const DEVICE_NAMESPACES_REQUIRED_MESSAGE =
  'DeviceNameSpaces: This field is required. Please provide a namespace mapping Map.';

export const DEVICE_NAMESPACES_EMPTY_MESSAGE =
  'DeviceNameSpaces: At least one namespace must be provided. The Map cannot be empty.';

/**
 * Schema for device-signed namespaces in mdoc
 * @description
 * Represents a record of namespaces and their corresponding device-signed items.
 * This schema validates that each namespace maps to valid device-signed items.
 *
 * ```cddl
 * DeviceNameSpaces = {* NameSpace => DeviceSignedItems}
 * ```
 *
 * @example
 * ```typescript
 * const namespaces = {
 *   "org.iso.18013.5.1": {}
 * };
 * const result = deviceNameSpacesSchema.parse(namespaces);
 * ```
 */
export const deviceNameSpacesSchema = z
  .map(nameSpaceSchema, deviceSignedItemsSchema, {
    invalid_type_error: DEVICE_NAMESPACES_INVALID_TYPE_MESSAGE,
    required_error: DEVICE_NAMESPACES_REQUIRED_MESSAGE,
  })
  .refine(
    (data) => {
      return data.size > 0;
    },
    {
      message: DEVICE_NAMESPACES_EMPTY_MESSAGE,
    }
  );

/**
 * Type definition for device-signed namespaces
 * @description
 * Represents a validated record of namespaces and their device-signed items
 *
 * @see {@link NameSpace}
 * @see {@link DeviceSignedItems}
 */
export type DeviceNameSpaces = z.output<typeof deviceNameSpacesSchema>;

/**
 * Type definition for device-signed namespace entries
 * @description
 * Represents a key-value pair from the device-signed namespaces record
 */
export type DeviceNameSpacesEntry = Entry<DeviceNameSpaces>;
