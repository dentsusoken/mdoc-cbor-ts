import { z } from 'zod';
import { nameSpaceSchema } from '../common';
import { digestIDsSchema } from './DigestIDs';

export const valueDigestsSchema = z.map(nameSpaceSchema, digestIDsSchema);

export type ValueDigests = z.infer<typeof valueDigestsSchema>;
