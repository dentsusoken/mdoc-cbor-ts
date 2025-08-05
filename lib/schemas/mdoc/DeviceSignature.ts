import { Sign1 } from '@auth0/cose';
import { z } from 'zod';
import {
  createBytesSchema,
  GENERIC_ERROR_MESSAGE as BYTES_GENERIC_ERROR_MESSAGE,
} from '@/schemas/common/Bytes';
import {
  createNumberMapSchema,
  GENERIC_ERROR_MESSAGE as NUMBER_MAP_GENERIC_ERROR_MESSAGE,
} from '@/schemas/common/NumberMap';

const protectedHeadersSchema = createBytesSchema(
  `ProtectedHeaders: ${BYTES_GENERIC_ERROR_MESSAGE}`
);

const unprotectedHeadersSchema = createNumberMapSchema(
  `UnprotectedHeaders: ${NUMBER_MAP_GENERIC_ERROR_MESSAGE}`
);

const payloadSchema = createBytesSchema(
  `Payload: ${BYTES_GENERIC_ERROR_MESSAGE}`
);

const signatureSchema = createBytesSchema(
  `Signature: ${BYTES_GENERIC_ERROR_MESSAGE}`
);

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
export const deviceSignatureSchema = z
  .tuple([
    protectedHeadersSchema, // protected headers (Bytes)
    unprotectedHeadersSchema, // unprotected headers (NumberMap)
    payloadSchema, // payload (Bytes)
    signatureSchema, // signature (Bytes)
  ])
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
