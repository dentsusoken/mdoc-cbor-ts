import { z } from 'zod';
import {
  dataElementIdentifierSchema,
  dataElementValueSchema,
  DataElementIdentifier,
  DataElementValue,
  Entry,
} from '../common';

export const deviceSignedItemsSchema = z.map(
  dataElementIdentifierSchema,
  dataElementValueSchema
);

/**
 * ```cddl
 * DeviceSignedItems = {+ DataElementIdentifier => DataElementValue}
 * ```
 * @see {@link DataElementIdentifier}
 * @see {@link DataElementValue}
 */
export type DeviceSignedItems = z.infer<typeof deviceSignedItemsSchema>;
export type DeviceSignedItemsEntry = Entry<DeviceSignedItems>;
