import { z } from 'zod';
import { Entry } from '@/schemas/common/Entry';
import { nameSpaceSchema } from '@/schemas/common/NameSpace';
import { errorItemsSchema } from './ErrorItems';

/**
 * Schema for errors in MDOC
 * @description
 * Represents a record of namespaces and their corresponding error items.
 * This schema validates that each namespace maps to valid error items.
 *
 * ```cddl
 * Errors = {+ NameSpace => ErrorItems}
 * ```
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
  .record(nameSpaceSchema, errorItemsSchema, {
    invalid_type_error:
      'Errors: Expected an object with namespaces as keys and error items as values.',
    required_error:
      'Errors: This field is required. Please provide a valid errors object.',
  })
  .refine(
    (data) => {
      return Object.keys(data).length > 0;
    },
    {
      message:
        'Errors: At least one namespace and error items pair is required.',
    }
  );

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
export type Errors = z.output<typeof errorsSchema>;

/**
 * Type definition for errors entries
 * @description
 * Represents a key-value pair from the errors record
 */
export type ErrorsEntry = Entry<Errors>;
