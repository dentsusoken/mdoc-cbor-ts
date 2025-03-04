import { z } from 'zod';
import { bytesSchema } from '../common';

export const mobileSecurityObjectBytesSchema = bytesSchema;

/**
 * ```cddl
 * MobileSecurityObjectBytes = #6.24(bstr .cbor MobileSecurityObject)
 * ```
 */
export type MobileSecurityObjectBytes = z.infer<
  typeof mobileSecurityObjectBytesSchema
>;
