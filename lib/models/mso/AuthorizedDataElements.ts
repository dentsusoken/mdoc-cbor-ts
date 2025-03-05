import { z } from 'zod';
import { nameSpaceSchema, Entry } from '../common';
import {
  dataElementsArraySchema,
  DataElementsArray,
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
