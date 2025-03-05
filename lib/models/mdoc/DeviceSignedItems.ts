import { z } from 'zod';
import {
  DataElementIdentifier,
  dataElementIdentifierSchema,
  DataElementValue,
  dataElementValueSchema,
  Entry,
} from '../common';

export const deviceSignedItemsSchema = z.record(
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
