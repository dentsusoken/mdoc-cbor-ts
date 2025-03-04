import { z } from 'zod';
import { nameSpaceSchema, NameSpace } from '../common';
import { digestIDsSchema, DigestIDs } from './DigestIDs';

export const valueDigestsSchema = z.map(nameSpaceSchema, digestIDsSchema);

/**
 * ```cddl
 * ValueDigests = {+ NameSpace => DigestIDs}
 * ```
 * @see {@link NameSpace}
 * @see {@link DigestIDs}
 */
export type ValueDigests = z.infer<typeof valueDigestsSchema>;
