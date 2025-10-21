import { z } from 'zod';
import { authorizedDataElementsSchema } from './AuthorizedDataElements';
import { authorizedNameSpacesSchema } from './AuthorizedNameSpaces';
import { createStrictMapSchema } from '@/schemas/containers/StrictMap';
import { createStrictMap } from '@/strict-map';

/**
 * Key authorizations entries for MSO key authorization schema.
 * @description
 * Used for constructing a strict mapping of optional authorization fields. The entries allow:
 * - `nameSpaces` (optional): validated by {@link authorizedNameSpacesSchema}
 * - `dataElements` (optional): validated by {@link authorizedDataElementsSchema}
 *
 */
export const keyAuthorizationsEntries = [
  ['nameSpaces', authorizedNameSpacesSchema.optional()],
  ['dataElements', authorizedDataElementsSchema.optional()],
] as const;

/**
 * Factory for creating a strict map of key authorizations.
 *
 * @description
 * This function leverages {@link createStrictMap} to produce a strongly-typed Map
 * representation of key authorization entries, as specified by {@link keyAuthorizationsEntries}.
 * The result is a strict map where only the allowed fields (`nameSpaces`, `dataElements`)
 * are permitted, with values validated against their respective schemas
 * ({@link authorizedNameSpacesSchema}, {@link authorizedDataElementsSchema}).
 *
 * @example
 * ```typescript
 * const map = createKeyAuthorizations([
 *   ['nameSpaces', ['org.iso.18013.5.1']],
 *   ['dataElements', new Map([['org.iso.18013.5.1', ['given_name']]])],
 * ]);
 * ```
 *
 * @see keyAuthorizationsEntries
 * @see createStrictMap
 */
export const createKeyAuthorizations = createStrictMap<
  typeof keyAuthorizationsEntries
>;

/**
 * Schema for key authorizations in MSO.
 * @description
 * Validates a `Map<string, unknown>` representing optional authorizations for an MSO key.
 * This schema accepts a Map input, transforms it to an object, and enforces strict, field-level constraints:
 *
 * - `nameSpaces` (optional): An array of authorized namespaces. Validated with {@link authorizedNameSpacesSchema}.
 * - `dataElements` (optional): Object/map from namespace to array of authorized data element identifiers. Validated with {@link authorizedDataElementsSchema}.
 *
 * Validation requirements:
 * - Input must be a `Map`. Plain objects or arrays are rejected with a `KeyAuthorizations: ...` error prefix.
 * - Only the specified fields (`nameSpaces`, `dataElements`) are accepted. Extra fields are not allowed.
 * - Both fields are optional, but if present must satisfy their schemas.
 *
 * CDDL:
 * ```cddl
 * KeyAuthorizations = {
 *   ? "nameSpaces": AuthorizedNameSpaces,
 *   ? "dataElements": AuthorizedDataElements
 * }
 * ```
 *
 * @example
 * ```typescript
 * const input = new Map<string, unknown>([
 *   ['nameSpaces', ['org.iso.18013.5.1']],
 *   [
 *     'dataElements',
 *     new Map([
 *       ['org.iso.18013.5.1', ['given_name', 'family_name']],
 *     ]),
 *   ],
 * ]);
 * const result = keyAuthorizationsSchema.parse(input); // KeyAuthorizations
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError: must be a Map (not object or array)
 * // keyAuthorizationsSchema.parse({ nameSpaces: [] });
 * ```
 *
 * @see createStrictMapSchema
 * @see authorizedNameSpacesSchema
 * @see authorizedDataElementsSchema
 */
export const keyAuthorizationsSchema = createStrictMapSchema({
  target: 'KeyAuthorizations',
  entries: keyAuthorizationsEntries,
});

/**
 * Type definition for key authorizations
 * @description
 * Represents a validated key authorizations structure.
 *
 * @see {@link AuthorizedNameSpaces}
 * @see {@link AuthorizedDataElements}
 */
export type KeyAuthorizations = z.output<typeof keyAuthorizationsSchema>;
