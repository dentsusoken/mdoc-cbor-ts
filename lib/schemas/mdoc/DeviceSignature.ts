import { Sign1 } from '@auth0/cose';
import { z } from 'zod';
import { numberMap } from '../common';

/**
 * Schema for device signatures in mdoc
 * @description
 * Represents a COSE_Sign1 signature created by the device.
 * This schema validates and transforms COSE_Sign1 objects while preserving their structure.
 *
 * @example
 * ```typescript
 * const sign1 = [protectedHeaders, unprotectedHeaders, payload, signature];
 * const result = deviceSignatureSchema.parse(sign1); // Returns Sign1
 * ```
 */
export const deviceSignatureSchema = z.array(z.any()).transform((sign1) => {
  const [protectedHeaders, unprotectedHeaders, payload, signature] = sign1;
  const unprotectedHeadersMap = numberMap.parse(unprotectedHeaders);
  return new Sign1(protectedHeaders, unprotectedHeadersMap, payload, signature);
});

/**
 * Type definition for device signatures
 * @description
 * Represents a validated COSE_Sign1 signature from the device
 *
 * ```cddl
 * DeviceSignature = COSE_Sign1
 * ```
 * @see {@link Sign1}
 */
export type DeviceSignature = z.infer<typeof deviceSignatureSchema>;
