import { z } from 'zod';
import { NameSpace, nameSpaceSchema } from '../common';
import { DigestIDs, digestIDsSchema } from './DigestIDs';

export const valueDigestsSchema = z.record(nameSpaceSchema, digestIDsSchema);

/**
 * ```cddl
 * ValueDigests = {+ NameSpace => DigestIDs}
 * ```
 * @see {@link NameSpace}
 * @see {@link DigestIDs}
 */
export type ValueDigests = z.infer<typeof valueDigestsSchema>;
