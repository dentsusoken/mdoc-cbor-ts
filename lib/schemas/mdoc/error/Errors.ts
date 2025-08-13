import { z } from 'zod';
import { Entry } from '@/schemas/common/Entry';
import { nameSpaceSchema } from '@/schemas/common/NameSpace';
import { errorItemsSchema } from './ErrorItems';
import { createMapSchema } from '@/schemas/common/Map';

/**
 * Schema for errors in MDOC
 * @description
 * Validates a required non-empty `Map<NameSpace, ErrorItems>`, where keys are
 * text namespaces validated by `nameSpaceSchema` and values are error item maps
 * validated by `errorItemsSchema`.
 *
 * Error messages are prefixed with `Errors: ...` and follow the standardized
 * messaging provided by the common Map schema utilities. The Map must contain
 * at least one entry.
 *
 * Validation rules:
 * - Requires a `Map` instance
 * - Requires at least one entry (non-empty)
 * - Each key must satisfy `nameSpaceSchema` (text)
 * - Each value must satisfy `errorItemsSchema` (Map<DataElementIdentifier, ErrorCode>)
 *
 * ```cddl
 * Errors = {+ NameSpace => ErrorItems}
 * ```
 *
 * @example
 * ```typescript
 * const errors = new Map<string, Map<string, number>>([
 *   ['org.iso.18013.5.1', new Map<string, number>([['given_name', 0]])],
 * ]);
 * const result = errorsSchema.parse(errors); // Map<NameSpace, ErrorItems>
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty map is not allowed)
 * // errorsSchema.parse(new Map());
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (not a Map)
 * // errorsSchema.parse({ 'org.iso.18013.5.1': new Map([['given_name', 0]]) });
 * ```
 *
 * @see nameSpaceSchema
 * @see errorItemsSchema
 * @see createMapSchema
 */
export const errorsSchema = createMapSchema({
  target: 'Errors',
  keySchema: nameSpaceSchema,
  valueSchema: errorItemsSchema,
});

/**
 * Type definition for errors
 * @description
 * Represents a validated record of namespaces and their error items
 *
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
