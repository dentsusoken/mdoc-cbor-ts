import { z } from 'zod';
import { Entry, NameSpace, nameSpaceSchema } from '../common';
import {
  DeviceSignedItems,
  deviceSignedItemsSchema,
} from './DeviceSignedItems';

export const deviceNameSpacesSchema = z.record(
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
