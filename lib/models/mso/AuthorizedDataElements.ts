import { z } from 'zod';
import { Entry, nameSpaceSchema } from '../common';
import {
  DataElementsArray,
  dataElementsArraySchema,
} from './DataElementsArray';

export const authorizedDataElementsSchema = z.record(
  nameSpaceSchema,
  dataElementsArraySchema
);

/**
 * ```cddl
 * AuthorizedDataElements = {+ NameSpace => DataElementsArray}
 * ```
 * @see {@link DataElementsArray}
 */
export type AuthorizedDataElements = z.infer<
  typeof authorizedDataElementsSchema
>;

export type AuthorizedDataElementsEntry = Entry<AuthorizedDataElements>;
