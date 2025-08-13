import { z } from 'zod';
import { authorizedDataElementsSchema } from './AuthorizedDataElements';
import { authorizedNameSpacesSchema } from './AuthorizedNameSpaces';
import { createStructSchema } from '@/schemas/common/Struct';

export const keyAuthorizationsObjectSchema = z.object({
  nameSpaces: authorizedNameSpacesSchema.optional(),
  dataElements: authorizedDataElementsSchema.optional(),
});

/**
 * Schema for key authorizations in MSO
 * @description
 * Validates a Map<string, unknown> representing the authorizations granted to a key.
 * The Map is converted into a plain object and validated against
 * `keyAuthorizationsObjectSchema`, which allows the following optional fields:
 * - `nameSpaces`: `AuthorizedNameSpaces`
 * - `dataElements`: `AuthorizedDataElements`
 *
 * Container type/required errors are prefixed with `KeyAuthorizations: ...` and follow
 * shared Map message suffixes. Field-level validations are delegated to the referenced schemas.
 *
 * ```cddl
 * KeyAuthorizations = {
 *  ? "nameSpaces": AuthorizedNameSpaces,
 *  ? "dataElements": AuthorizedDataElements
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
 * // Throws ZodError (invalid container type)
 * // keyAuthorizationsSchema.parse({ nameSpaces: [] });
 * ```
 *
 * @see createStructSchema
 * @see authorizedNameSpacesSchema
 * @see authorizedDataElementsSchema
 */
export const keyAuthorizationsSchema = createStructSchema({
  target: 'KeyAuthorizations',
  objectSchema: keyAuthorizationsObjectSchema,
});

/**
 * Type definition for key authorizations
 * @description
 * Represents a validated key authorizations structure.
 *
 * @see {@link AuthorizedNameSpaces}
 * @see {@link AuthorizedDataElements}
 */
export type KeyAuthorizations = z.infer<typeof keyAuthorizationsSchema>;
