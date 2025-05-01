import { z } from 'zod';
import {
  AuthorizedDataElements,
  authorizedDataElementsSchema,
} from './AuthorizedDataElements';
import {
  AuthorizedNameSpaces,
  authorizedNameSpacesSchema,
} from './AuthorizedNameSpaces';

/**
 * Schema for key authorizations in MSO
 * @description
 * Represents the authorizations granted to a key, including optional namespace
 * and data element authorizations. This schema validates the structure of key authorizations.
 *
 * @example
 * ```typescript
 * const authorizations = {
 *   nameSpaces: ["org.iso.18013.5.1"],
 *   dataElements: {
 *     "org.iso.18013.5.1": ["given_name", "family_name"]
 *   }
 * };
 * const result = keyAuthorizationsSchema.parse(authorizations); // Returns KeyAuthorizations
 * ```
 */
export const keyAuthorizationsSchema = z
  .map(z.any(), z.any())
  .transform((data) => {
    return z
      .object({
        nameSpaces: authorizedNameSpacesSchema.optional(),
        dataElements: authorizedDataElementsSchema.optional(),
      })
      .parse(Object.fromEntries(data));
  });
/**
 * Type definition for key authorizations
 * @description
 * Represents a validated key authorizations structure
 *
 * ```cddl
 * KeyAuthorizations = {
 *  ? "nameSpaces": AuthorizedNameSpaces,
 *  ? "dataElements": AuthorizedDataElements
 * }
 * ```
 * @see {@link AuthorizedNameSpaces}
 * @see {@link AuthorizedDataElements}
 */
export type KeyAuthorizations = z.infer<typeof keyAuthorizationsSchema>;
