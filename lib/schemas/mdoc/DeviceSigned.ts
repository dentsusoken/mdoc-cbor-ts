import { z } from 'zod';
import { deviceAuthSchema } from './DeviceAuth';
import { createStrictMapSchema } from '@/schemas/containers/StrictMap';
import { deviceNameSpacesSchema } from './DeviceNameSpaces';
import { createStrictMap } from '@/strict-map/createStrictMap';

/**
 * Entries definition for the DeviceSigned schema in mdoc.
 * @description
 * Specifies the required fields and their corresponding schemas for device-signed data.
 * Used by {@link createStrictMapSchema} to validate and infer type information for DeviceSigned Map structures.
 *
 * Structure:
 * - "nameSpaces": Validated by {@link deviceNameSpacesSchema}, mapping namespace strings
 *   to sets of device-signed item values.
 * - "deviceAuth": Validated by {@link deviceAuthSchema}, representing the CBOR DeviceAuth signature container.
 *
 * ```cddl
 * DeviceSigned = {
 *   "nameSpaces": DeviceNameSpaces,
 *   "deviceAuth": DeviceAuth
 * }
 * ```
 *
 * @see {@link deviceNameSpacesSchema}
 * @see {@link deviceAuthSchema}
 */
export const deviceSignedEntries = [
  ['nameSpaces', deviceNameSpacesSchema],
  ['deviceAuth', deviceAuthSchema],
] as const;

/**
 * Factory function for constructing a DeviceSigned Map.
 * @description
 * Uses the entry definitions from {@link deviceSignedEntries} to enforce the required structure
 * for a DeviceSigned value, suitable for mdoc.
 *
 * This provides a strongly-typed helper for building DeviceSigned maps:
 * - "nameSpaces": A Map mapping namespace strings to device-signed data elements.
 * - "deviceAuth": A DeviceAuth structure containing device signature/authentication.
 *
 * @example
 * ```typescript
 * const deviceSigned = createDeviceSigned([
 *   ['nameSpaces', new Map([['org.iso.18013.5.1', new Map([['claim', 42]])]])],
 *   ['deviceAuth', deviceAuthMap]
 * ]);
 * ```
 * @see {@link deviceSignedEntries}
 */
export const createDeviceSigned = createStrictMap<typeof deviceSignedEntries>;

/**
 * Zod schema for device-signed data in mdoc.
 * @description
 * Validates the device-signed section of a mobile document (mdoc),
 * ensuring correct structure for namespaces and device authentication data.
 *
 * The schema enforces:
 * - The object is a `Map` with exactly two required entries:
 *   - `"nameSpaces"`: A Map where each key is a non-empty string (namespace)
 *     and each value is a non-empty set of device-signed items.
 *   - `"deviceAuth"`: A Map describing the device authentication container.
 *
 * @example
 * ```typescript
 * const deviceSigned = new Map([
 *   ['nameSpaces', new Map([
 *     ['org.iso.18013.5.1', new Map([['claim', 42]])],
 *   ])],
 *   ['deviceAuth', new Map([
 *     // DeviceAuth structure as required
 *   ])],
 * ]);
 * deviceSignedSchema.parse(deviceSigned); // Validates structure and types
 * ```
 *
 * @see {@link deviceSignedEntries}
 * @see {@link deviceNameSpacesSchema}
 * @see {@link deviceAuthSchema}
 */
export const deviceSignedSchema = createStrictMapSchema({
  target: 'DeviceSigned',
  entries: deviceSignedEntries,
});

/**
 * Output type for device-signed data in mdoc.
 * @description
 * Type inferred from the {@link deviceSignedSchema}.
 *
 * Typically used for type checking and code completion when handling validated DeviceSigned data.
 *
 * @see {@link deviceSignedSchema}
 */
export type DeviceSigned = z.output<typeof deviceSignedSchema>;
