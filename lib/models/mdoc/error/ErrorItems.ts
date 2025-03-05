import { z } from 'zod';
import {
  DataElementIdentifier,
  dataElementIdentifierSchema,
  Entry,
} from '../../common';
import { ErrorCode, errorCodeSchema } from './ErrorCode';

export const errorItemsSchema = z.record(
  dataElementIdentifierSchema,
  errorCodeSchema
);

/**
 * ```cddl
 * ErrorItems = {+ DataElementIdentifier => ErrorCode}
 * ```
 * @see {@link DataElementIdentifier}
 * @see {@link ErrorCode}
 */
export type ErrorItems = z.infer<typeof errorItemsSchema>;
export type ErrorItemsEntry = Entry<ErrorItems>;
