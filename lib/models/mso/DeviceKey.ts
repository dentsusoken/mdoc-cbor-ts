import { COSEKey } from '@auth0/cose';
import { z } from 'zod';

export const deviceKeySchema = z.custom<COSEKey>().transform((key) => {
  return new COSEKey(key);
});

/**
 * ```cddl
 * DeviceKey = COSE_Key
 * ```
 * @see {@link COSEKey}
 */
export type DeviceKey = z.infer<typeof deviceKeySchema>;
