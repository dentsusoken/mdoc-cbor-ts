import { z } from 'zod';
import { nameSpaceSchema, NameSpace } from '../common';

export const authorizedNameSpacesSchema = z.array(nameSpaceSchema).nonempty();

/**
 * ```cddl
 * AuthorizedNameSpaces = [+ NameSpace]
 * ```
 * @see {@link NameSpace}
 */
export type AuthorizedNameSpaces = z.infer<typeof authorizedNameSpacesSchema>;
