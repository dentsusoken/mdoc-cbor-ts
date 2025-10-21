import { z } from 'zod';
import { deviceMacSchema } from './DeviceMac';
import { deviceSignatureSchema } from './DeviceSignature';
import { createStrictMapSchema } from '@/schemas/containers/StrictMap';

/**
 * Error message indicating that at least one device authentication method must be provided.
 *
 * @type {string}
 * @constant
 * @description
 * Used by the DeviceAuth schema to signal that at least one of `deviceSignature` or `deviceMac`
 * must be present in the input data structure. This message appears in schema validation errors
 * when both authentication methods are missing.
 *
 * @example
 * // Usage within a schema refinement:
 * z.object(...).refine(
 *   obj => obj.deviceSignature || obj.deviceMac,
 *   { message: DEVICE_AUTH_AT_LEAST_ONE_MESSAGE }
 * );
 */
export const DEVICE_AUTH_AT_LEAST_ONE_MESSAGE =
  'DeviceAuth: At least one authentication method (deviceSignature or deviceMac) must be provided.';

/**
 * Entries definition for the DeviceAuth schema in mdoc.
 * @description
 * Specifies the optional authentication fields and their associated schemas for device authentication.
 * This entries tuple is used by the container schema utilities to define and validate the
 * acceptable fields for a device authentication object or map.
 *
 * Structure:
 * - "deviceSignature": Optionally included, validated by {@link deviceSignatureSchema}.
 * - "deviceMac": Optionally included, validated by {@link deviceMacSchema}.
 *
 * @see {@link deviceSignatureSchema}
 * @see {@link deviceMacSchema}
 * @example
 * ```typescript
 * // Used within object or map schemas:
 * [
 *   ['deviceSignature', deviceSignatureSchema.optional()],
 *   ['deviceMac', deviceMacSchema.optional()],
 * ]
 * ```
 */
export const deviceAuthEntries = [
  ['deviceSignature', deviceSignatureSchema.optional()],
  ['deviceMac', deviceMacSchema.optional()],
] as const;

/**
 * Schema for device authentication as a strict `Map` in mdoc.
 * @description
 * Defines the `DeviceAuth` schema for use in mobile document (mdoc) flows, accepting a `Map<string, unknown>`
 * and enforcing the presence of at least one device authentication mechanism: either a device signature,
 * a device MAC, or both. Each entry is validated using the schemas provided by {@link deviceAuthEntries}.
 *
 * - The input must be a `Map` (not a plain object).
 * - Keys: `"deviceSignature"` and/or `"deviceMac"`, both optional. At least one must be present.
 * - Values: Must conform to the shapes of {@link deviceSignatureSchema} and {@link deviceMacSchema} respectively.
 * - Output: A validated `Map` instance with entries `"deviceSignature"` and/or `"deviceMac"`, as present in input.
 *
 * The schema enforces (via `.refine`) that at least one of:
 *   - `"deviceSignature"` (COSE_Sign1, see {@link deviceSignatureSchema})
 *   - `"deviceMac"` (COSE_Mac0, see {@link deviceMacSchema})
 * is present. If neither is present, validation will fail with a clear error message.
 *
 * Typical usage is as part of a parent map schema, e.g. in an outer mdoc structure:
 * ```typescript
 * // Valid examples:
 * new Map([
 *   ['deviceSignature', sign1Instance],
 * ]);
 *
 * new Map([
 *   ['deviceMac', mac0Instance],
 * ]);
 *
 * new Map([
 *   ['deviceSignature', sign1Instance],
 *   ['deviceMac', mac0Instance],
 * ]);
 * ```
 *
 * @see {@link deviceSignatureSchema}
 * @see {@link deviceMacSchema}
 * @see {@link deviceAuthEntries}
 * @see {@link DeviceAuth}
 */
export const deviceAuthSchema = createStrictMapSchema({
  target: 'DeviceAuth',
  entries: deviceAuthEntries,
}).refine(
  (value) =>
    value instanceof Map
      ? value.get('deviceSignature') || value.get('deviceMac')
      : true,
  {
    message: DEVICE_AUTH_AT_LEAST_ONE_MESSAGE,
  }
);

/**
 * Type definition for device authentication
 * @description
 * Represents a validated device authentication mechanism
 *
 * @see {@link DeviceSignature}
 * @see {@link DeviceMac}
 */
export type DeviceAuth = z.output<typeof deviceAuthSchema>;
