import { z } from 'zod';
import { digestIDSchema, DigestID } from './DigestID';
import { digestSchema, Digest } from './Digest';

export const digestIDsSchema = z.record(digestIDSchema, digestSchema);

/**
 * ```cddl
 * DigestIDs = {+ DigestID => Digest}
 * ```
 * @see {@link DigestID}
 * @see {@link Digest}
 */
export type DigestIDs = z.infer<typeof digestIDsSchema>;
