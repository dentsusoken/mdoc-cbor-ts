import { z } from 'zod';
import { Entry } from '@/schemas/common/Entry';
import { nameSpaceSchema } from '@/schemas/common/NameSpace';
import { deviceSignedItemsSchema } from './DeviceSignedItems';
import {
  MAP_EMPTY_MESSAGE_SUFFIX,
  MAP_INVALID_TYPE_MESSAGE_SUFFIX,
  MAP_REQUIRED_MESSAGE_SUFFIX,
  createMapSchema,
} from '@/schemas/common/Map';

/**
 * Schema for device-signed namespaces in mdoc
 * @description
 * Represents a mapping of `NameSpace` to `DeviceSignedItems`.
 * This schema validates that each namespace key maps to valid device-signed items
 * and that the mapping is non-empty.
 *
 * ```cddl
 * DeviceNameSpaces = {* NameSpace => DeviceSignedItems}
 * ```
 *
 * @example
 * ```typescript
 * const namespaces = new Map<string, unknown>([
 *   ["org.iso.18013.5.1", new Map()],
 * ]);
 * const result = deviceNameSpacesSchema.parse(namespaces); // Returns Map<NameSpace, DeviceSignedItems>
 * ```
 */
export const deviceNameSpacesSchema = createMapSchema({
  target: 'DeviceNameSpaces',
  keySchema: nameSpaceSchema,
  valueSchema: deviceSignedItemsSchema,
});

// Standardized error messages (built from common Map suffixes)
export const DEVICE_NAMESPACES_INVALID_TYPE_MESSAGE = `DeviceNameSpaces: ${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`;
export const DEVICE_NAMESPACES_REQUIRED_MESSAGE = `DeviceNameSpaces: ${MAP_REQUIRED_MESSAGE_SUFFIX}`;
export const DEVICE_NAMESPACES_EMPTY_MESSAGE = `DeviceNameSpaces: ${MAP_EMPTY_MESSAGE_SUFFIX}`;

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
