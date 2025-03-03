import { z } from 'zod';

export const authorizedNameSpaceSchema = z.array(z.string()).nonempty();

export type AuthorizedNameSpace = z.infer<typeof authorizedNameSpaceSchema>;
