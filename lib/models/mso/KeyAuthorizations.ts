import { z } from 'zod';
import {
  AuthorizedDataElements,
  authorizedDataElementsSchema,
} from './AuthorizedDataElements';
import {
  AuthorizedNameSpaces,
  authorizedNameSpacesSchema,
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
