import { Mac0 } from '@auth0/cose';
import { z } from 'zod';
import {
  bytesSchema,
  createBytesSchema,
  GENERIC_ERROR_MESSAGE as BYTES_GENERIC_ERROR_MESSAGE,
} from '../common/Bytes';
import {
  createNumberMapSchema,
  GENERIC_ERROR_MESSAGE as NUMBER_MAP_GENERIC_ERROR_MESSAGE,
} from '../common/NumberMap';

const protectedHeadersSchema = createBytesSchema(
  `ProtectedHeaders: ${BYTES_GENERIC_ERROR_MESSAGE}`
);

const unprotectedHeadersSchema = createNumberMapSchema(
  `UnprotectedHeaders: ${NUMBER_MAP_GENERIC_ERROR_MESSAGE}`
);

const payloadSchema = createBytesSchema(
  `Payload: ${BYTES_GENERIC_ERROR_MESSAGE}`
);

const tagSchema = createBytesSchema(`Tag: ${BYTES_GENERIC_ERROR_MESSAGE}`);

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
    protectedHeadersSchema, // protected headers (Bytes)
    unprotectedHeadersSchema, // unprotected headers (NumberMap)
    payloadSchema, // payload (Bytes)
    tagSchema, // tag (Bytes)
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
