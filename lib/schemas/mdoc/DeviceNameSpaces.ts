import { z } from 'zod';
import { Entry, NameSpace, nameSpaceSchema } from '../common';
import {
  DeviceSignedItems,
  deviceSignedItemsSchema,
} from './DeviceSignedItems';

/**
 * Schema for device-signed namespaces in mdoc
 * @description
 * Represents a record of namespaces and their corresponding device-signed items.
 * This schema validates that each namespace maps to valid device-signed items.
 *
 * @example
 * ```typescript
 * const namespaces = {
 *   "org.iso.18013.5.1": {}
 * };
 * const result = deviceNameSpacesSchema.parse(namespaces);
 * ```
 */
export const deviceNameSpacesSchema = z.record(
  nameSpaceSchema,
  deviceSignedItemsSchema
);

/**
 * Type definition for device-signed namespaces
 * @description
 * Represents a validated record of namespaces and their device-signed items
 *
 * ```cddl
 * DeviceNameSpaces = {+ NameSpace => DeviceSignedItems}
 * ```
 * @see {@link NameSpace}
 * @see {@link DeviceSignedItems}
 */
export type DeviceNameSpaces = z.infer<typeof deviceNameSpacesSchema>;

/**
 * Type definition for device-signed namespace entries
 * @description
 * Represents a key-value pair from the device-signed namespaces record
 */
export type DeviceNameSpacesEntry = Entry<DeviceNameSpaces>;
