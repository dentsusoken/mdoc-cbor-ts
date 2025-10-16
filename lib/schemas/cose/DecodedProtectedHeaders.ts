import { Headers } from '@/cose/types';
import {
  type StrictMapEntries,
  type StrictMapEntriesWithUnknownKeys,
  type MapWithTypedGetFromEntries,
  defineBuilderFactoryWithUnknownKeys,
  createStrictMapSchemaWithUnknownKeys,
} from '../common/containers/StrictMap';
import { createAlgorithmsSchema } from './Algorithms';

/**
 * The entries definition for DecodedProtectedHeaders.
 * @description
 * This array defines the allowed protected header fields for COSE, currently only supporting the 'alg' (Algorithm) header.
 * The key is the COSE header label (number), and the value is a Zod schema for the allowed value.
 *
 * @see {@link Headers.Algorithm}
 * @see {@link createAlgorithmsSchema}
 */
const decodedProtectedHeadersEntries = [
  [Headers.Algorithm, createAlgorithmsSchema('alg')],
] as const satisfies StrictMapEntries;

/**
 * Type parameter combining entries and unknown key constraint for DecodedProtectedHeaders.
 */
type DecodedProtectedHeadersWithUnknownKeys = StrictMapEntriesWithUnknownKeys<
  typeof decodedProtectedHeadersEntries,
  Headers
>;

/**
 * Factory for building DecodedProtectedHeaders Maps with type safety.
 * @description
 * Provides a builder with type-checked `.set()` for known header fields and `.setUnknown()` for unknown fields.
 * Unknown fields must use keys from the Headers enum.
 *
 * @example
 * ```typescript
 * const builder = createDecodedProtectedHeadersBuilder()
 *   .set(Headers.Algorithm, -7)              // Set 'alg' to ES256 (type-safe)
 *   .setUnknown(Headers.KeyId, 'key-123')    // Set unknown header (Headers enum only)
 *   .setUnknown(Headers.IV, new Uint8Array([1, 2, 3]));
 * const headers = builder.build();
 * ```
 */
export const createDecodedProtectedHeadersBuilder: ReturnType<
  typeof defineBuilderFactoryWithUnknownKeys<DecodedProtectedHeadersWithUnknownKeys>
> =
  defineBuilderFactoryWithUnknownKeys<DecodedProtectedHeadersWithUnknownKeys>();

/**
 * Type representing a Map of decoded protected COSE headers with typed `.get()` support.
 * @description
 * - Keys are COSE header labels from the Headers enum.
 * - Values are typed according to the schema for known headers, or `unknown` for unknown headers.
 * - Known keys (from decodedProtectedHeadersEntries) return their specific types
 * - Unknown keys return `unknown`
 *
 * This type is automatically derived from decodedProtectedHeadersEntries.
 *
 * @see {@link createDecodedProtectedHeadersBuilder}
 */
export type DecodedProtectedHeaders = MapWithTypedGetFromEntries<
  typeof decodedProtectedHeadersEntries,
  Headers
>;

/**
 * Zod schema for DecodedProtectedHeaders.
 * @description
 * Validates a Map of COSE protected headers, allowing both known and unknown header fields.
 * - Known fields are validated according to their schema (e.g., 'alg').
 * - Unknown fields are allowed (passthrough mode).
 *
 * The output type supports `.get()` with all Headers enum values:
 * - `.get(Headers.Algorithm)` returns the validated algorithm number
 * - `.get(Headers.KeyId)` returns `unknown` for unknown headers
 *
 * @example
 * ```typescript
 * // Valid: Algorithm header with ES256 (-7)
 * const result = decodedProtectedHeadersSchema.parse(
 *   new Map([[Headers.Algorithm, -7]])
 * );
 * result.get(Headers.Algorithm); // number | undefined (type-safe)
 * result.get(Headers.KeyId);     // unknown
 * ```
 */
export const decodedProtectedHeadersSchema =
  createStrictMapSchemaWithUnknownKeys<
    DecodedProtectedHeadersWithUnknownKeys,
    DecodedProtectedHeaders
  >({
    target: 'DecodedProtectedHeaders',
    entries: decodedProtectedHeadersEntries,
    unknownKeys: 'passthrough',
  });
