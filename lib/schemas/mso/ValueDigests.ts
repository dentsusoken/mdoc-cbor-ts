import { z } from 'zod';
import { digestIDsSchema } from './DigestIDs';
import { createMapSchema } from '@/schemas/containers/Map';

/**
 * Zod schema for validating ValueDigests map in MSO.
 *
 * @description
 * Validates a non-empty Map of NameSpace (string) to DigestIDs collections, in accordance with the CDDL definition:
 *
 * ```cddl
 * ValueDigests = {+ NameSpace => DigestIDs}
 * ```
 *
 * - Input: A CBOR-decoded `Map<string, unknown>`, where each key is a nonempty string representing NameSpace,
 *   and each value is a DigestIDs map.
 * - Keys are validated as nonempty strings (minimum 1 character).
 * - Values are validated with `digestIDsSchema`.
 * - The map must not be empty (`nonempty: true`).
 * - Uses `createMapSchema`, which enforces the Map type and provides friendly error messages
 *   with the 'ValueDigests' prefix.
 * - If working with plain JS objects, convert to Map before using this schema.
 *
 * @note
 * The `nonempty: true` option ensures that empty ValueDigests are rejected and a specific error is returned.
 *
 * @example
 * ```typescript
 * import { typedMap } from '@/utils/typedMap';
 * import { valueDigestsSchema } from '@/schemas/mso/ValueDigests';
 *
 * const input = typedMap([
 *   ['org.iso.18013.5.1', [[1, new Uint8Array([0x01, 0x02])]]],
 * ]);
 *
 * const value = valueDigestsSchema.parse(input);
 * // value is a validated Map<NameSpace, DigestIDs>
 * ```
 */
export const valueDigestsSchema = createMapSchema({
  target: 'ValueDigests',
  keySchema: z.string().min(1),
  valueSchema: digestIDsSchema,
  nonempty: true,
});

/**
 * Type definition for value digests
 * @description
 * Represents a validated record of namespaces and their digest IDs.
 * The output type corresponds to the parsed Map structure.
 *
 * @see {@link NameSpace}
 * @see {@link DigestIDs}
 */
export type ValueDigests = z.output<typeof valueDigestsSchema>;
