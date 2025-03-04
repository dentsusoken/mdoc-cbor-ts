import { z } from 'zod';
import { digestIDSchema } from './DigestID';
import { digestSchema } from './Digest';

export const digestIDsSchema = z.map(digestIDSchema, digestSchema);

export type DigestIDs = z.infer<typeof digestIDsSchema>;
