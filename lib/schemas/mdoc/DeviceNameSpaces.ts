import { z } from 'zod';
import { deviceSignedItemsSchema } from './DeviceSignedItems';
import { createMapSchema } from '@/schemas/containers/Map';

/**
 * Schema for device-signed namespaces in mdoc
 * @description
 * Represents a mapping of `NameSpace` (non-empty string) to `DeviceSignedItems` (each mapped value must be non-empty).
 * This schema ensures that every namespace key is a non-empty string and each associated value is a non-empty set of device-signed items.
 * **Note:** The top-level map (DeviceNameSpaces) itself may be empty and is considered valid in this schema.
 * Each `DeviceSignedItems` value, however, must always be non-empty as enforced by {@link deviceSignedItemsSchema}.
 *
 * ```cddl
 * DeviceNameSpaces = {* NameSpace => DeviceSignedItems}
 * ```
 * - DeviceNameSpaces: can be empty.
 * - DeviceSignedItems in each mapping: must be non-empty.
 *
 * @example
 * ```typescript
 * // Valid: at least one DeviceSignedItems entry (and that entry is non-empty)
 * const namespaces = new Map<string, unknown>([
 *   ["org.iso.18013.5.1", new Map([['claim', 42]])],
 * ]);
 * const result = deviceNameSpacesSchema.parse(namespaces); // Returns Map<NameSpace, DeviceSignedItems>
 *
 * // Valid: DeviceNameSpaces can itself be empty
 * const empty = new Map();
 * deviceNameSpacesSchema.parse(empty); // Valid
 *
 * // Invalid: value must be non-empty DeviceSignedItems
 * // deviceNameSpacesSchema.parse(new Map([["org.iso.18013.5.1", new Map()]])); // Throws ZodError
 * ```
 */
export const deviceNameSpacesSchema = createMapSchema({
  target: 'DeviceNameSpaces',
  keySchema: z.string().min(1), // NameSpace
  valueSchema: deviceSignedItemsSchema, // DeviceSignedItems
});

/**
 * Type representing device-signed namespaces in mdoc.
 * @description
 * This type is inferred from the {@link deviceNameSpacesSchema}. It represents
 * a validated mapping of NameSpace (non-empty string) to DeviceSignedItems (a non-empty map).
 *
 * Typically used for type safety and code completion when handling validated DeviceNameSpaces
 * parsed by the {@link deviceNameSpacesSchema}.
 *
 * @see {@link deviceNameSpacesSchema}
 */
export type DeviceNameSpaces = z.output<typeof deviceNameSpacesSchema>;
