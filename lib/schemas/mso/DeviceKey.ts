import { COSEKey } from '@auth0/cose';
import { z } from 'zod';

/**
 * Schema for device key in MSO
 * @description
 * Represents a COSE_Key used for device authentication.
 * This schema validates and transforms COSE_Key objects while preserving their structure.
 *
 * @example
 * ```typescript
 * const key = new COSEKey({});
 * const result = deviceKeySchema.parse(key);
 * ```
 */
export const deviceKeySchema = z.custom<COSEKey>().transform((key) => {
  return new COSEKey(key);
});

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
export type DeviceKey = z.infer<typeof deviceKeySchema>;
