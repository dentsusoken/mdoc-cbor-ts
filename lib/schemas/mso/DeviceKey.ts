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
// TODO: which is better? instanceOf or custom?
export const deviceKeySchema = z.map(z.any(), z.any()).transform((data) => {
  return new COSEKey(data);
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
