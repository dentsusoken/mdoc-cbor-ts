import { z } from 'zod';
import { Entry, NameSpace, nameSpaceSchema } from '../../common';
import { ErrorItems, errorItemsSchema } from './ErrorItems';

/**
 * Schema for errors in MDOC
 * @description
 * Represents a record of namespaces and their corresponding error items.
 * This schema validates that each namespace maps to valid error items.
 *
 * @example
 * ```typescript
 * const errors = {
 *   "org.iso.18013.5.1": {
 *     "given_name": 0
 *   }
 * };
 * const result = errorsSchema.parse(errors); // Returns Errors
 * ```
 */
export const errorsSchema = z
  .record(nameSpaceSchema, errorItemsSchema)
  .refine((data) => {
    return Object.keys(data).length > 0;
  });

/**
 * Type definition for errors
 * @description
 * Represents a validated record of namespaces and their error items
 *
 * ```cddl
 * Errors = {+ NameSpace => ErrorItems}
 * ```
 * @see {@link NameSpace}
 * @see {@link ErrorItems}
 */
export type Errors = z.infer<typeof errorsSchema>;

/**
 * Type definition for errors entries
 * @description
 * Represents a key-value pair from the errors record
 */
export type ErrorsEntry = Entry<Errors>;
