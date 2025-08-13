import { Sign1 } from '@auth0/cose';
import { z } from 'zod';
import { createBytesSchema } from '@/schemas/common/Bytes';
import { createUintSchema } from '@/schemas/common/Uint';
import { createMapSchema } from '@/schemas/common/Map';

const protectedHeadersSchema = createBytesSchema('ProtectedHeaders');

const unprotectedHeadersSchema = createMapSchema({
  target: 'UnprotectedHeaders',
  keySchema: createUintSchema('UnprotectedHeaders.Key'),
  valueSchema: z.any(),
  allowEmpty: true,
});

const payloadSchema = createBytesSchema('Payload');

const signatureSchema = createBytesSchema('Signature');

export const DEVICE_SIGNATURE_INVALID_TYPE_MESSAGE =
  'DeviceSignature: Expected an array with 4 elements (protected headers, unprotected headers, payload, signature). Please provide a valid COSE_Sign1 structure.';
export const DEVICE_SIGNATURE_REQUIRED_MESSAGE =
  'DeviceSignature: This field is required. Please provide a COSE_Sign1 signature array.';
export const DEVICE_SIGNATURE_TOO_FEW_MESSAGE =
  'DeviceSignature: Array must contain at least 4 element(s)';
export const DEVICE_SIGNATURE_TOO_MANY_MESSAGE =
  'DeviceSignature: Array must contain at most 4 element(s)';

/**
 * Schema for device signatures in mdoc
 * @description
 * Represents a COSE_Sign1 signature created by the device.
 * This schema validates and transforms COSE_Sign1 objects while preserving their structure.
 *
 * ```cddl
 * DeviceSignature = COSE_Sign1
 * COSE_Sign1 = [
 *   protected:   bstr,
 *   unprotected: map,
 *   payload:     bstr,
 *   signature:   bstr
 * ]
 * ```
 *
 * @example
 * ```typescript
 * const sign1 = [protectedHeaders, unprotectedHeaders, payload, signature];
 * const result = deviceSignatureSchema.parse(sign1); // Returns Sign1
 * ```
 */
const deviceSignatureTuple = z.tuple(
  [
    protectedHeadersSchema, // protected headers (Bytes)
    unprotectedHeadersSchema, // unprotected headers (NumberMap)
    payloadSchema, // payload (Bytes)
    signatureSchema, // signature (Bytes)
  ],
  {
    invalid_type_error: DEVICE_SIGNATURE_INVALID_TYPE_MESSAGE,
    required_error: DEVICE_SIGNATURE_REQUIRED_MESSAGE,
  }
);

export const deviceSignatureSchema = z
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
        message: DEVICE_SIGNATURE_TOO_FEW_MESSAGE,
      });
    } else if (val.length > 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        type: 'array',
        maximum: 4,
        inclusive: true,
        exact: false,
        message: DEVICE_SIGNATURE_TOO_MANY_MESSAGE,
      });
    }
  })
  .pipe(deviceSignatureTuple)
  .transform(([protectedHeaders, unprotectedHeaders, payload, signature]) => {
    return new Sign1(protectedHeaders, unprotectedHeaders, payload, signature);
  });

/**
 * Type definition for device signatures
 * @description
 * Represents a validated COSE_Sign1 signature from the device
 *
 * @see {@link Sign1}
 */
export type DeviceSignature = z.output<typeof deviceSignatureSchema>;
