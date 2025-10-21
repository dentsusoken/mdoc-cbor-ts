import { z } from 'zod';
import { createMapSchema } from '@/schemas/containers/Map';

/**
 * Schema for device-signed items in mdoc
 * @description
 * Validates a required, non-empty `Map` where each key is a non-empty `string`
 * (serving as a DataElementIdentifier) and each value is any value (DataElementValue).
 *
 * Validation rules:
 * - Input must be a `Map` instance
 * - Map must contain at least one entry (nonempty)
 * - Keys: must be strings of length 1 or more (`z.string().min(1)`)
 * - Values: any value is allowed (`z.unknown()`)
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
 */
export const deviceSignedItemsSchema = createMapSchema({
  target: 'DeviceSignedItems',
  keySchema: z.string().min(1), // DataElementIdentifier: string of at least length 1
  valueSchema: z.unknown(), // DataElementValue: any value allowed
  nonempty: true,
});

/**
 * Type definition for device-signed items
 * @description
 * A validated, non-empty mapping of {@link DataElementIdentifier} to
 * {@link DataElementValue} that are signed by the device (ISO/IEC 18013-5).
 */
export type DeviceSignedItems = z.output<typeof deviceSignedItemsSchema>;
