import { z } from 'zod';
import { createKeyMapSchema } from '@/schemas/cose/KeyMap';
import { Key } from '@/cose/types';

/**
 * Error message used when a `DeviceKey` is missing the required key type label.
 *
 * This message is shown when a COSE_Key map does not include the key type (label `1`, a.k.a. `kty`).
 * It is used as a standardized Zod error message during validation.
 *
 * @see {@link deviceKeySchema}
 * @example
 * ```typescript
 * // Throws ZodError if label 1 is missing.
 * // Example map without kty (only kid present):
 * // import { Key, type KeyValues } from '@/cose/types';
 * deviceKeySchema.parse(
 *   new Map<KeyValues, unknown>([[Key.KeyId, new Uint8Array([1, 2, 3])]])
 * );
 * // => ZodError
 * ```
 */
export const DEVICE_KEY_MISSING_KTY_MESSAGE =
  'DeviceKey: COSE_Key must include label 1 (kty).';

/**
 * Zod schema for a DeviceKey (COSE_Key) used in MSO.
 *
 * - Accepts a Map representing a COSE_Key, where keys are numeric or string labels.
 * - Requires label `1` (kty) to be present in the map.
 * - Validates structure and provides standardized error messages with a `DeviceKey:` prefix.
 *
 * Validation details:
 * - Input must be a Map with numeric or string labels.
 * - The key type label (1, or `KeyType`) is mandatory.
 *
 * CDDL reference:
 * ```cddl
 * DeviceKey = COSE_Key
 *
 * COSE_Key = {
 *   1 => kty,               ; Key Type
 *   ? 2 => kid,             ; Key ID
 *   ? 3 => alg,             ; Algorithm
 *   ? 4 => key_ops,         ; Key Operations
 *   ? 5 => Base_IV,         ; Base Initialization Vector
 *   * label => values       ; Additional parameters depending on key type
 * }
 *
 * kty = int / tstr
 * kid = bstr
 * alg = int / tstr
 * key_ops = [+ (int / tstr)]
 * Base_IV = bstr
 * label = int / tstr
 * values = any
 * ```
 *
 * @example
 * ```typescript
 * import { Key, KeyType, Algorithm, type KeyValues } from '@/cose/types';
 *
 * // Valid DeviceKey example (use COSE enums for labels/values):
 * const keyMap = new Map<KeyValues, unknown>([[Key.KeyType, KeyType.EC]]);
 * const result = deviceKeySchema.parse(keyMap); // COSEKey
 * ```
 *
 * @example
 * ```typescript
 * import { Key, KeyType, Algorithm, type KeyValues } from '@/cose/types';
 *
 * // Throws ZodError for missing kty:
 * const missingKty = new Map<KeyValues, unknown>([[Key.Algorithm, Algorithm.ES256]]);
 * deviceKeySchema.parse(missingKty);
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError for invalid type:
 * // @ts-expect-error
 * deviceKeySchema.parse({ 1: 2 });
 * ```
 *
 * @see {@link Key}
 */
export const deviceKeySchema = createKeyMapSchema('DeviceKey').refine(
  (value) => (value instanceof Map ? value.has(Key.KeyType) : true),
  { message: DEVICE_KEY_MISSING_KTY_MESSAGE }
);

/**
 * Type definition for device key
 * @description
 * Represents a validated COSE_Key for device authentication
 *
 * @see {@link COSEKey}
 */
export type DeviceKey = z.output<typeof deviceKeySchema>;
