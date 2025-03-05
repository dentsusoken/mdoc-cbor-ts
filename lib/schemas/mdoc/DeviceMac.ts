import { Mac0 } from '@auth0/cose';
import { z } from 'zod';
import { numberMap } from '../common';

/**
 * Schema for device MAC in mdoc
 * @description
 * Represents a COSE_Mac0 MAC created by the device.
 * This schema validates and transforms COSE_Mac0 objects while preserving their structure.
 *
 * @example
 * ```typescript
 * const mac0 = [protectedHeaders, unprotectedHeaders, payload, tag];
 * const result = deviceMacSchema.parse(mac0); // Returns Mac0
 * ```
 */
export const deviceMacSchema = z.array(z.any()).transform((mac) => {
  const [protectedHeaders, unprotectedHeaders, payload, tag] = mac;
  const unprotectedHeadersMap = numberMap.parse(unprotectedHeaders);
  return new Mac0(protectedHeaders, unprotectedHeadersMap, payload, tag);
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
export type DeviceMac = z.infer<typeof deviceMacSchema>;
