import { z } from 'zod';
import { nameSpaceSchema } from '@/schemas/common/NameSpace';
import { digestIDsSchema } from './DigestIDs';
import { createMapSchema } from '@/schemas/common/Map';

/**
 * Schema for value digests in MSO
 * @description
 * Validates a Map of namespaces to digest ID collections.
 * Input is a `Map<string, unknown>` (CBOR-decoded) that maps:
 * - key: `NameSpace` (validated by `nameSpaceSchema`)
 * - value: `DigestIDs` (validated by `digestIDsSchema`)
 *
 * ```cddl
 * ValueDigests = {+ NameSpace => DigestIDs}
 * ```
 *
 * Notes:
 * - Uses `createMapSchema` which enforces Map type, non-emptiness by default,
 *   and prefixes errors with the target name (`ValueDigests`).
 * - Intended to be used with CBOR-decoded Maps; plain JS objects should be
 *   converted to Maps prior to validation if needed.
 *
 * @example
 * ```typescript
 * import { valueDigestsSchema } from '@/schemas/mso/ValueDigests';
 *
 * const input = new Map<string, unknown>([
 *   [
 *     'org.iso.18013.5.1',
 *     new Map<number, unknown>([[0, new Uint8Array([0x01, 0x02])]])
 *   ],
 * ]);
 *
 * const value = valueDigestsSchema.parse(input);
 * // value is a validated Map<NameSpace, DigestIDs>
 * ```
 */
export const valueDigestsSchema = createMapSchema({
  target: 'ValueDigests',
  keySchema: nameSpaceSchema,
  valueSchema: digestIDsSchema,
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
