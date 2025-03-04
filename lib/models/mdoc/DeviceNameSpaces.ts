import { z } from 'zod';
import { Entry, nameSpaceSchema, NameSpace } from '../common';
import {
  deviceSignedItemsSchema,
  DeviceSignedItems,
} from './DeviceSignedItems';

export const deviceNameSpacesSchema = z.map(
  nameSpaceSchema,
  deviceSignedItemsSchema
);

/**
 * ```cddl
 * DeviceNameSpaces = {+ NameSpace => DeviceSignedItems}
 * ```
 * @see {@link NameSpace}
 * @see {@link DeviceSignedItems}
 */
export type DeviceNameSpaces = z.infer<typeof deviceNameSpacesSchema>;
export type DeviceNameSpacesEntry = Entry<DeviceNameSpaces>;
