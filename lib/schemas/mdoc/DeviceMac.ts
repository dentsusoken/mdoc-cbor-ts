import { Mac0 } from '@auth0/cose';
import { z } from 'zod';
import { bytesSchema } from '../common/Bytes';
import { numberMapSchema } from '../common/NumberMap';

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
export const deviceMacSchema = z
  .tuple([
    bytesSchema, // protected headers (Bytes)
    numberMapSchema, // unprotected headers (NumberMap)
    bytesSchema, // payload (Bytes)
    bytesSchema, // tag (Bytes)
  ])
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
