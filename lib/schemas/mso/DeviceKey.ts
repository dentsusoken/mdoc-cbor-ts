import { COSEKey } from '@auth0/cose';
import { z } from 'zod';
import { createLabelKeyMapSchema } from '@/schemas/cose/LabelKeyMap';

export const DEVICE_KEY_MISSING_KTY_MESSAGE =
  'DeviceKey: COSE_Key must include label 1 (kty) or "kty".';

/**
 * Schema for device key in MSO
 * @description
 * Validates a required COSE_Key mapping represented as a `Map<label, value>`
 * where labels are integers or text. Ensures the presence of the key type
 * label (`1` or `'kty'`) and transforms the validated Map into a `COSEKey`
 * instance while preserving structure.
 *
 * Error messages are prefixed with `DeviceKey: ...` and standardized via the
 * exported message constants.
 *
 * Validation rules:
 * - Requires a `Map` instance with numeric or string labels
 * - Requires presence (non-undefined)
 * - Requires that label `1` (kty) or `'kty'` is present
 *
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
 * const keyMap = new Map<unknown, unknown>([[1, 2]]); // 1 => kty (e.g., 2 for EC2)
 * const result = deviceKeySchema.parse(keyMap); // COSEKey
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (missing kty)
 * // Message: DeviceKey: COSE_Key must include label 1 (kty) or "kty".
 * const missingKty = new Map<unknown, unknown>([[3, 'ES256']]);
 * deviceKeySchema.parse(missingKty);
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: DeviceKey: Expected a Map with numeric or string labels for COSE_Key parameters.
 * // @ts-expect-error
 * deviceKeySchema.parse({ 1: 2 });
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (required)
 * // Message: DeviceKey: This field is required. Please provide a COSE_Key mapping.
 * // @ts-expect-error
 * deviceKeySchema.parse(undefined);
 * ```
 *
 * @see {@link COSEKey}
 */
export const deviceKeySchema = createLabelKeyMapSchema('DeviceKey', false)
  .superRefine((map, ctx) => {
    if (!map.has(1) && !map.has('kty')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: DEVICE_KEY_MISSING_KTY_MESSAGE,
      });
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .transform((data) => new COSEKey(data as Map<any, any>));

/**
 * Type definition for device key
 * @description
 * Represents a validated COSE_Key for device authentication
 *
 * @see {@link COSEKey}
 */
export type DeviceKey = z.output<typeof deviceKeySchema>;
