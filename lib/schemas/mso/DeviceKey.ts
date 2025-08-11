import { COSEKey } from '@auth0/cose';
import { z } from 'zod';

/**
 * Schema for device key in MSO
 * @description
 * Represents a COSE_Key used for device authentication.
 * This schema validates and transforms COSE_Key objects while preserving their structure.
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
 * const result = deviceKeySchema.parse(keyMap); // Returns COSEKey
 * ```
 */
export const deviceKeySchema = z
  .map(
    z.union([z.number(), z.string()]), // label = int / tstr
    z.any(),
    {
      invalid_type_error:
        'DeviceKey: Expected a Map with numeric or string labels for COSE_Key parameters.',
      required_error:
        'DeviceKey: This field is required. Please provide a COSE_Key mapping.',
    }
  )
  .superRefine((map, ctx) => {
    if (!map.has(1) && !map.has('kty')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'COSE_Key must include label 1 (kty) or "kty".',
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
 * ```cddl
 * DeviceKey = COSE_Key
 * ```
 * @see {@link COSEKey}
 */
export type DeviceKey = z.output<typeof deviceKeySchema>;
