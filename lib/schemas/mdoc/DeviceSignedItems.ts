import { z } from 'zod';
import { dataElementIdentifierSchema } from '../common/DataElementIdentifier';
import { dataElementValueSchema } from '../common/DataElementValue';
import { createMapSchema } from '@/schemas/common/Map';

/**
 * Schema for device-signed items in mdoc
 * @description
 * Validates a required, non-empty `Map` of `DataElementIdentifier` to `DataElementValue`
 * representing the data elements signed by the device.
 *
 * Validation rules:
 * - Requires input to be a `Map`
 * - Disallows empty maps (at least one entry is required)
 * - Keys must satisfy {@link DataElementIdentifier}
 * - Values must satisfy {@link DataElementValue}
 *
 * Error messages are prefixed with the target name: `DeviceSignedItems: ...`.
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
 *
 * @see {@link DataElementIdentifier}
 * @see {@link DataElementValue}
 */
export const deviceSignedItemsSchema = createMapSchema({
  target: 'DeviceSignedItems',
  keySchema: dataElementIdentifierSchema,
  valueSchema: dataElementValueSchema,
});

/**
 * Type definition for device-signed items
 * @description
 * A validated, non-empty mapping of {@link DataElementIdentifier} to
 * {@link DataElementValue} that are signed by the device (ISO/IEC 18013-5).
 */
export type DeviceSignedItems = z.output<typeof deviceSignedItemsSchema>;
