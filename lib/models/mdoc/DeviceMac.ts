import { Mac0 } from '@auth0/cose';
import { z } from 'zod';

export const deviceMacSchema = z.custom<Mac0>().transform((mac) => {
  const { protectedHeaders, unprotectedHeaders, payload, tag } = mac;
  return new Mac0(protectedHeaders, unprotectedHeaders, payload, tag);
});

/**
 * ```cddl
 * DeviceMac = COSE_Mac0
 * ```
 * @see {@link Mac0}
 */
export type DeviceMac = z.infer<typeof deviceMacSchema>;
