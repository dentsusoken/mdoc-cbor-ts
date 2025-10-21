import { z } from 'zod';
import { deviceAuthSchema } from './DeviceAuth';
import { embeddedCborSchema } from '@/schemas/cbor/EmbeddedCbor';
import { createStrictMapSchema } from '@/schemas/containers/StrictMap';

/**
 * Entries definition for the DeviceSigned schema in mdoc.
 * @description
 * Specifies the required fields and their associated schemas for the device-signed
 * container as used in mdoc. This definition is provided to {@link createStrictMapSchema}
 * to enable validation and type inference for device-signed Map inputs.
 *
 * Structure:
 * - "nameSpaces": Required. Validated by {@link embeddedCborSchema}, representing a CBOR-encoded
 *   DeviceNameSpaces structure (i.e., `DeviceNameSpacesBytes`).
 * - "deviceAuth": Required. Validated by {@link deviceAuthSchema}, representing the device
 *   authentication container (either signature or MAC or both).
 *
 * ```cddl
 * DeviceSigned = {
 *   "nameSpaces": DeviceNameSpacesBytes,
 *   "deviceAuth": DeviceAuth
 * }
 * ```
 *
 * @see {@link embeddedCborSchema}
 * @see {@link deviceAuthSchema}
 */
export const deviceSignedEntries = [
  ['nameSpaces', embeddedCborSchema], // DeviceNameSpacesBytes
  ['deviceAuth', deviceAuthSchema],
] as const;

/**
 * Schema for device-signed data in mdoc
 * @description
 * Validates the main container of device-signed data in mdoc, ensuring the presence of mandatory
 * "nameSpaces" (CBOR-encoded device-signed namespaces) and "deviceAuth" (authentication, either
 * device signature, device MAC, or both). Uses a strict Map schema to enforce both presence and type.
 *
 * ```cddl
 * DeviceSigned = {
 *   "nameSpaces": DeviceNameSpacesBytes,
 *   "deviceAuth": DeviceAuth
 * }
 * ```
 *
 * @example
 * ```typescript
 * const map = new Map<string, unknown>([
 *   ['nameSpaces', deviceNameSpacesBytesValue],
 *   ['deviceAuth', deviceAuthValue],
 * ]);
 * const result = deviceSignedSchema.parse(map); // Returns Map<string, unknown>
 * ```
 *
 * @see {@link embeddedCborSchema}
 * @see {@link deviceAuthSchema}
 * @see {@link DeviceSigned}
 */
export const deviceSignedSchema = createStrictMapSchema({
  target: 'DeviceSigned',
  entries: deviceSignedEntries,
});

/**
 * Type definition for device-signed data
 * @description
 * Represents a validated device-signed data structure
 *
 * @see {@link DeviceNameSpacesBytes}
 * @see {@link DeviceAuth}
 */
export type DeviceSigned = z.output<typeof deviceSignedSchema>;
