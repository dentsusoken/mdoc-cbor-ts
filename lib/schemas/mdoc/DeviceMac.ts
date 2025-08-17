import { Mac0 } from '@auth0/cose';
import { z } from 'zod';
import { createBytesSchema } from '@/schemas/common/Bytes';
import { createHeadersSchema } from '@/schemas/common/Headers';

const protectedHeadersSchema = createBytesSchema('ProtectedHeaders');

const unprotectedHeadersSchema = createHeadersSchema('UnprotectedHeaders');

const payloadSchema = createBytesSchema('Payload');

const tagSchema = createBytesSchema('Tag');

export const DEVICE_MAC_INVALID_TYPE_MESSAGE =
  'DeviceMac: Expected an array with 4 elements (protected headers, unprotected headers, payload, tag). Please provide a valid COSE_Mac0 structure.';
export const DEVICE_MAC_REQUIRED_MESSAGE =
  'DeviceMac: This field is required. Please provide a COSE_Mac0 MAC array.';
export const DEVICE_MAC_TOO_FEW_MESSAGE =
  'DeviceMac: Array must contain at least 4 element(s)';
export const DEVICE_MAC_TOO_MANY_MESSAGE =
  'DeviceMac: Array must contain at most 4 element(s)';

/**
 * Schema for device MAC in mdoc
 * @description
 * Represents a COSE_Mac0 MAC created by the device.
 * This schema validates and transforms COSE_Mac0 objects while preserving their structure.
 *
 * ```cddl
 * DeviceMac = COSE_Mac0
 * COSE_Mac0 = [
 *   protected:   bstr,
 *   unprotected: map,
 *   payload:     bstr,
 *   tag:         bstr
 * ]
 * ```
 *
 * @example
 * ```typescript
 * const mac0 = [protectedHeaders, unprotectedHeaders, payload, tag];
 * const result = deviceMacSchema.parse(mac0); // Returns Mac0
 * ```
 */
const deviceMacTuple = z.tuple(
  [
    protectedHeadersSchema, // protected headers (Bytes)
    unprotectedHeadersSchema, // unprotected headers (NumberMap)
    payloadSchema, // payload (Bytes)
    tagSchema, // tag (Bytes)
  ],
  {
    invalid_type_error: DEVICE_MAC_INVALID_TYPE_MESSAGE,
    required_error: DEVICE_MAC_REQUIRED_MESSAGE,
  }
);

export const deviceMacSchema = z
  .any()
  .superRefine((val, ctx) => {
    if (!Array.isArray(val)) return;
    if (val.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        type: 'array',
        minimum: 4,
        inclusive: true,
        exact: false,
        message: DEVICE_MAC_TOO_FEW_MESSAGE,
      });
    } else if (val.length > 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        type: 'array',
        maximum: 4,
        inclusive: true,
        exact: false,
        message: DEVICE_MAC_TOO_MANY_MESSAGE,
      });
    }
  })
  .pipe(deviceMacTuple)
  .transform(([protectedHeaders, unprotectedHeaders, payload, tag]) => {
    return new Mac0(protectedHeaders, unprotectedHeaders, payload, tag);
  });

/**
 * Type definition for device MAC
 * @description
 * Represents a validated COSE_Mac0 MAC from the device
 *
 * ```cddl
 * DeviceMac = COSE_Mac0
 * ```
 * @see {@link Mac0}
 */
export type DeviceMac = z.output<typeof deviceMacSchema>;
