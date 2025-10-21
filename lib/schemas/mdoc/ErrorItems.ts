import { z } from 'zod';
import { createMapSchema } from '@/schemas/containers/Map';

/**
 * Schema for error items in MDOC
 * @description
 * Validates a required non-empty `Map<DataElementIdentifier, ErrorCode>`, where
 * keys are non-empty strings and values are integers. The Map must contain at least one entry.
 *
 * Error messages are prefixed with `ErrorItems: ...` and follow the
 * standardized messaging provided by the common Map schema utilities.
 *
 * Validation rules:
 * - Requires a `Map` instance
 * - Must contain at least one entry (non-empty)
 * - Each key must be a non-empty string (DataElementIdentifier)
 * - Each value must be an integer (ErrorCode)
 *
 * ```cddl
 * ErrorItems = {+ DataElementIdentifier => int}
 * ```
 *
 * @example
 * ```typescript
 * const errors = new Map<string, number>([
 *   ['given_name', 0],
 *   ['age', -1],
 * ]);
 * const result = errorItemsSchema.parse(errors); // Map<string, number>
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty map is not allowed)
 * // errorItemsSchema.parse(new Map());
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (not a Map)
 * // errorItemsSchema.parse({ given_name: 0 });
 * ```
 *
 * @see createMapSchema
 */
export const errorItemsSchema = createMapSchema({
  target: 'ErrorItems',
  keySchema: z.string().min(1), // DataElementIdentifier
  valueSchema: z.number().int(), // ErrorCode
  nonempty: true,
});

/**
 * Type definition for error items
 * @description
 * Represents a validated record of data element identifiers and their error codes
 *
 * @see {@link DataElementIdentifier}
 * @see {@link ErrorCode}
 */
export type ErrorItems = z.output<typeof errorItemsSchema>;
