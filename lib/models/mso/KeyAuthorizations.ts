import { z } from 'zod';
import {
  authorizedDataElementsSchema,
  AuthorizedDataElements,
} from './AuthorizedDataElements';
import {
  authorizedNameSpacesSchema,
  AuthorizedNameSpaces,
} from './AuthorizedNameSpaces';

export const keyAuthorizationsSchema = z.object({
  nameSpaces: authorizedNameSpacesSchema.optional(),
  dataElements: authorizedDataElementsSchema.optional(),
});

/**
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
