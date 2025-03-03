import { z } from 'zod';
import { dataElementIdentifierSchema, nameSpaceSchema, Entry } from '../common';

export const authorizedDataElementsSchema = z.map(
  nameSpaceSchema,
  dataElementIdentifierSchema
);

export type AuthorizedDataElements = z.infer<
  typeof authorizedDataElementsSchema
>;

export type AuthorizedDataElementsEntry = Entry<AuthorizedDataElements>;
