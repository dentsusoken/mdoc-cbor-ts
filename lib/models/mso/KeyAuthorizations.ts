import { z } from 'zod';
import { authorizedDataElementsSchema } from './AuthorizedDataElements';
import { authorizedNameSpaceSchema } from './AuthorizedNameSpace';

export const keyAuthorizationsSchema = z.object({
  nameSpaces: authorizedNameSpaceSchema.optional(),
  dataElements: authorizedDataElementsSchema.optional(),
});

export type KeyAuthorization = z.infer<typeof keyAuthorizationsSchema>;
