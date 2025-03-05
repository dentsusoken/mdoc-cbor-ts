import { z } from 'zod';
import { Digest, digestSchema } from './Digest';
import { DigestID, digestIDSchema } from './DigestID';

export const digestIDsSchema = z.record(digestIDSchema, digestSchema);

/**
 * ```cddl
 * DigestIDs = {+ DigestID => Digest}
 * ```
 * @see {@link DigestID}
 * @see {@link Digest}
 */
export type DigestIDs = z.infer<typeof digestIDsSchema>;
