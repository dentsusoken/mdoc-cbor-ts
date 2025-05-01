import { TypedMap } from '@jfromaniello/typedmap';
import { z } from 'zod';
import { ByteString } from '../../cbor';
import { KVMap } from '../../types';
import { MobileSecurityObject } from './MobileSecurityObject';
// TODO: instanceof ByteStringが正しい。
/**
 * Schema for CBOR-encoded mobile security object
 * @description
 * Represents a mobile security object encoded as a binary string.
 * This schema validates that the data is a valid binary string.
 *
 * @example
 * ```typescript
 * const bytes = Buffer.from([]);
 * const result = mobileSecurityObjectBytesSchema.parse(bytes); // Returns MobileSecurityObjectBytes
 * ```
 */
export const mobileSecurityObjectBytesSchema = z.instanceof(
  ByteString<TypedMap<KVMap<MobileSecurityObject>>>
);

/**
 * Type definition for CBOR-encoded mobile security object
 * @description
 * Represents a validated CBOR-encoded mobile security object
 *
 * ```cddl
 * MobileSecurityObjectBytes = #6.24(bstr .cbor MobileSecurityObject)
 * ```
 * @see {@link MobileSecurityObject}
 */
export type MobileSecurityObjectBytes = z.infer<
  typeof mobileSecurityObjectBytesSchema
>;
