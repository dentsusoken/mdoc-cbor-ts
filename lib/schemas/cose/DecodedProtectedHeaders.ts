import { z } from 'zod';
import { Algorithm, Header } from '@/cose/types';
import { createSemiStrictMap } from '@/strict-map/createSemiStrictMap';
import { createSemiStrictMapSchema } from '../containers';

/**
 * Entries for DecodedProtectedHeaders semi-strict map.
 * @description
 * Defines the header keys and corresponding Zod schemas for protected COSE header parameters.
 * Currently includes only the Algorithm header and its enumeration of supported algorithms.
 *
 * @example
 * ```typescript
 * decodedProtectedHeadersEntries.forEach(([key, schema]) => {
 *   // key: Header name (Symbol or string)
 *   // schema: Zod schema for the value
 * });
 * ```
 */
export const decodedProtectedHeadersEntries = [
  [Header.Algorithm, z.nativeEnum(Algorithm)],
] as const;

/**
 * Type helper for constructing a DecodedProtectedHeaders semi-strict map.
 * @description
 * Use this when you want to programmatically generate a strongly-typed
 * DecodedProtectedHeaders instance.
 *
 * @see {@link decodedProtectedHeadersEntries}
 *
 * @example
 * ```typescript
 * const headers = createDecodedProtectedHeaders([
 *   [Headers.Algorithm, Algorithms.ES256],
 * ]);
 * ```
 */
export const createDecodedProtectedHeaders = createSemiStrictMap<
  typeof decodedProtectedHeadersEntries,
  Header
>;

/**
 * Zod schema for decoded protected headers in COSE structures.
 * @description
 * Validates a Map or object against the allowed protected header parameters defined by
 * {@link decodedProtectedHeadersEntries}. Ensures only permitted keys and value types are present.
 *
 * @example
 * ```typescript
 * DecodedProtectedHeadersSchema.parse(new Map([
 *   [Headers.Algorithm, Algorithms.ES256]
 * ])); // Success
 * ```
 */
export const DecodedProtectedHeadersSchema = createSemiStrictMapSchema({
  target: 'DecodedProtectedHeaders',
  entries: decodedProtectedHeadersEntries,
});

/**
 * Type representing validated decoded protected headers.
 * @description
 * This type is the output produced by parsing with {@link DecodedProtectedHeadersSchema}.
 */
export type DecodedProtectedHeaders = z.output<
  typeof DecodedProtectedHeadersSchema
>;
