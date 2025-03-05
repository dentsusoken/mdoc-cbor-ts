import { z } from 'zod';
import {
  dataElementIdentifierSchema,
  DataElementIdentifier,
} from '../../common';
import { errorCodeSchema, ErrorCode } from './ErrorCode';
import { Entry } from '../../common';

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
