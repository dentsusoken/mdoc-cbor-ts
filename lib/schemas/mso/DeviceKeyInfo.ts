import { z } from 'zod';
import { deviceKeySchema } from './DeviceKey';
import { keyAuthorizationsSchema } from './KeyAuthorizations';
import { keyInfoSchema } from './KeyInfo';
import { createStructSchema } from '@/schemas/common/Struct';

export const deviceKeyInfoObjectSchema = z.object({
  deviceKey: deviceKeySchema,
  keyAuthorizations: keyAuthorizationsSchema.optional(),
  keyInfo: keyInfoSchema.optional(),
});

/**
 * Schema for device key information in MSO
 * @description
 * Validates a Map<string, unknown> that is transformed into a plain object and
 * checked against `deviceKeyInfoObjectSchema`. It describes a device key along
 * with optional authorizations and metadata.
 *
 * Container type/required errors are prefixed with `DeviceKeyInfo: ...` and follow
 * the shared Map message suffixes. Field-level validation is delegated to
 * `deviceKeySchema`, `keyAuthorizationsSchema`, and `keyInfoSchema`.
 *
 * ```cddl
 * DeviceKeyInfo = {
 *  "deviceKey": DeviceKey,
 *  ? "keyAuthorizations": KeyAuthorizations,
 *  ? "keyInfo": KeyInfo
 * }
 * ```
 *
 * @example
 * Map-based input (converted to object before validation):
 * - deviceKey: COSE_Key as Map (e.g., new Map([[1, 2]]))
 * - keyAuthorizations: see KeyAuthorizations (e.g., new Map([["nameSpaces", ["org.iso.18013.5.1"]]]))
 * - keyInfo: see KeyInfo (e.g., new Map([[1, "value"]]))
 * Parse with the schema to get DeviceKeyInfo.
 *
 * @example
 * Throws ZodError for invalid container type (object instead of Map).
 *
 * @see createStructSchema
 * @see deviceKeySchema
 * @see keyAuthorizationsSchema
 * @see keyInfoSchema
 */
export const deviceKeyInfoSchema = createStructSchema({
  target: 'DeviceKeyInfo',
  objectSchema: deviceKeyInfoObjectSchema,
});

/**
 * Type definition for device key information
 * @description
 * Represents a validated device key information structure.
 *
 * @see {@link DeviceKey}
 * @see {@link KeyAuthorizations}
 * @see {@link KeyInfo}
 */
export type DeviceKeyInfo = z.output<typeof deviceKeyInfoSchema>;
