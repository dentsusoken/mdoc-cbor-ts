import { z } from 'zod';
import {
  DataElementIdentifier,
  dataElementIdentifierSchema,
  Entry,
} from '../../common';
import { ErrorCode, errorCodeSchema } from './ErrorCode';

/**
 * Schema for error items in MDOC
 * @description
 * Represents a record of data element identifiers and their corresponding error codes.
 * This schema validates that each data element identifier maps to a valid error code.
 *
 * @example
 * ```typescript
 * const errors = {
 *   "given_name": 0
 * };
 * const result = errorItemsSchema.parse(errors); // Returns ErrorItems
 * ```
 */
export const errorItemsSchema = z.record(
  dataElementIdentifierSchema,
  errorCodeSchema
);

/**
 * Type definition for error items
 * @description
 * Represents a validated record of data element identifiers and their error codes
 *
 * ```cddl
 * ErrorItems = {+ DataElementIdentifier => ErrorCode}
 * ```
 * @see {@link DataElementIdentifier}
 * @see {@link ErrorCode}
 */
export type ErrorItems = z.infer<typeof errorItemsSchema>;

/**
 * Type definition for error items entries
 * @description
 * Represents a key-value pair from the error items record
 */
export type ErrorItemsEntry = Entry<ErrorItems>;
