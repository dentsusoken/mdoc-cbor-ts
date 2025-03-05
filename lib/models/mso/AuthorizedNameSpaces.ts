import { z } from 'zod';
import { NameSpace, nameSpaceSchema } from '../common';

export const authorizedNameSpacesSchema = z.array(nameSpaceSchema).nonempty();

/**
 * ```cddl
 * AuthorizedNameSpaces = [+ NameSpace]
 * ```
 * @see {@link NameSpace}
 */
export type AuthorizedNameSpaces = z.infer<typeof authorizedNameSpacesSchema>;
