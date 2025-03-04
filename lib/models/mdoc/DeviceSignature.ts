import { Sign1 } from '@auth0/cose';
import { z } from 'zod';

export const deviceSignatureSchema = z.custom<Sign1>().transform((sign1) => {
  const { protectedHeaders, unprotectedHeaders, payload, signature } = sign1;
  return new Sign1(protectedHeaders, unprotectedHeaders, payload, signature);
});

/**
 * ```cddl
 * DeviceSignature = COSE_Sign1
 * ```
 * @see {@link Sign1}
 */
export type DeviceSignature = z.infer<typeof deviceSignatureSchema>;
