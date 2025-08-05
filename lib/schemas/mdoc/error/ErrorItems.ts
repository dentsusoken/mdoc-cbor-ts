import { z } from 'zod';
import { dataElementIdentifierSchema } from '@/schemas/common/DataElementIdentifier';
import { Entry } from '@/schemas/common/Entry';
import { errorCodeSchema } from './ErrorCode';

/**
 * Schema for error items in MDOC
 * @description
 * Represents a record of data element identifiers and their corresponding error codes.
 * This schema validates that each data element identifier maps to a valid error code.
 *
 * ```cddl
 * ErrorItems = {+ DataElementIdentifier => ErrorCode}
 * ```
 *
 * @example
 * ```typescript
 * const errors = {
 *   "given_name": 0
 * };
 * const result = errorItemsSchema.parse(errors); // Returns ErrorItems
 * ```
 */
export const errorItemsSchema = z
  .record(dataElementIdentifierSchema, errorCodeSchema, {
    invalid_type_error:
      'ErrorItems: Expected an object with data element identifiers as keys and error codes as values.',
    required_error:
      'ErrorItems: This field is required. Please provide a valid error items object.',
  })
  .refine(
    (data) => {
      return Object.keys(data).length > 0;
    },
    {
      message:
        'ErrorItems: At least one data element identifier and error code pair is required.',
    }
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
export type ErrorItems = z.output<typeof errorItemsSchema>;

/**
 * Type definition for error items entries
 * @description
 * Represents a key-value pair from the error items record
 *
 * ```cddl
 * ErrorItemsEntry = [DataElementIdentifier, ErrorCode]
 * ```
 */
export type ErrorItemsEntry = Entry<ErrorItems>;
