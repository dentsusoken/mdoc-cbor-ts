import { z } from 'zod';
import { errorItemsSchema } from './ErrorItems';
import { createMapSchema } from '@/schemas/containers/Map';

/**
 * Schema for errors in MDOC
 * @description
 * Validates a required non-empty `Map<NameSpace, ErrorItems>`, where each key is a non-empty string
 * representing a namespace, and each value is an `ErrorItems` map validated by `errorItemsSchema`.
 *
 * Error messages are prefixed with `Errors: ...` and follow the standardized messaging provided by
 * the common Map schema utilities. The Map must contain at least one entry.
 *
 * Validation rules:
 * - Requires a `Map` instance
 * - Must contain at least one entry (non-empty)
 * - Each key must be a non-empty string (namespace)
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
 * @see errorItemsSchema
 * @see createMapSchema
 */
export const errorsSchema = createMapSchema({
  target: 'Errors',
  keySchema: z.string().min(1), // NameSpace
  valueSchema: errorItemsSchema, // ErrorItems
  nonempty: true,
});

/**
 * Type definition for errors in MDOC
 * @description
 * Represents a validated record mapping namespace strings to error items.
 * This type is inferred from the {@link errorsSchema} and ensures type safety for
 * handling error information associated with specific namespaces.
 *
 * @see {@link errorsSchema}
 * @see {@link ErrorItems}
 */
export type Errors = z.output<typeof errorsSchema>;
