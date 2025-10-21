import { z } from 'zod';
import { deviceKeySchema } from './DeviceKey';
import { keyAuthorizationsSchema } from './KeyAuthorizations';
import { keyInfoSchema } from './KeyInfo';
import { createStrictMapSchema } from '@/schemas/containers/StrictMap';

/**
 * Field entries for the DeviceKeyInfo map/object schema.
 *
 * @description
 * Describes the strict set of fields accepted in a DeviceKeyInfo structure.
 * - "deviceKey" (required): A COSE_Key for device authentication, validated by {@link deviceKeySchema}.
 * - "keyAuthorizations" (optional): Describes permitted usages, validated by {@link keyAuthorizationsSchema}.
 * - "keyInfo" (optional): Arbitrary extra metadata or informational values, validated by {@link keyInfoSchema}.
 *
 * Enforced by {@link createStrictMapSchema}, this tuple determines which fields are accepted and their validators.
 *
 * @see {@link deviceKeySchema}
 * @see {@link keyAuthorizationsSchema}
 * @see {@link keyInfoSchema}
 * @see {@link createStrictMapSchema}
 */
export const deviceKeyInfoEntries = [
  ['deviceKey', deviceKeySchema],
  ['keyAuthorizations', keyAuthorizationsSchema.optional()],
  ['keyInfo', keyInfoSchema.optional()],
] as const;

/**
 * Zod schema for the DeviceKeyInfo structure used in MSO (Mobile Security Object).
 *
 * @description
 * Validates a strict Map containing device key information, enforcing exactly the allowed fields and delegating field validation to individual schemas as follows:
 *
 * - `"deviceKey"` (**required**): Contains a COSE_Key for the device. This field is validated by {@link deviceKeySchema}.
 * - `"keyAuthorizations"` (optional): Specifies permitted key usages, validated by {@link keyAuthorizationsSchema}.
 * - `"keyInfo"` (optional): Allows arbitrary extra metadata or informational entries, validated by {@link keyInfoSchema}.
 *
 * Validation behavior:
 * - Input must be an instance of Map. If the input is not a Map, error messages are prefixed with `DeviceKeyInfo:`.
 * - Only the fields listed above are permitted; no additional keys are allowed (strict schema).
 * - Errors for missing required fields, type mismatches, or incomplete/invalid data are constructed using canonical error messages with a `DeviceKeyInfo:` prefix.
 * - Sub-field errors (for each key) use the corresponding validator for error reporting and structure.
 *
 * CDDL Reference:
 * ```cddl
 * DeviceKeyInfo = {
 *   "deviceKey": DeviceKey,
 *   ? "keyAuthorizations": KeyAuthorizations,
 *   ? "keyInfo": KeyInfo
 * }
 * ```
 *
 * @example
 * ```typescript
 * const valid = new Map([
 *   ['deviceKey', validDeviceKey],
 *   ['keyAuthorizations', validKeyAuthorizations], // optional
 *   ['keyInfo', validKeyInfo],                     // optional
 * ]);
 * deviceKeyInfoSchema.parse(valid); // Passes validation
 * ```
 *
 * @example
 * // Throws if input is not a Map:
 * deviceKeyInfoSchema.parse({ deviceKey: validDeviceKey }); // Throws ZodError
 *
 * @see createStrictMapSchema
 * @see deviceKeySchema
 * @see keyAuthorizationsSchema
 * @see keyInfoSchema
 */
export const deviceKeyInfoSchema = createStrictMapSchema({
  target: 'DeviceKeyInfo',
  entries: deviceKeyInfoEntries,
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
