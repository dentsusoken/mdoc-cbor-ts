import { z } from 'zod';
import { dataElementIdentifierSchema } from '@/schemas/common/DataElementIdentifier';
import { createMapSchema } from '@/schemas/common/container/Map';
import { errorCodeSchema } from './ErrorCode';

/**
 * Schema for error items in MDOC
 * @description
 * Validates a required non-empty `Map<DataElementIdentifier, ErrorCode>`, where
 * keys are text identifiers validated by `dataElementIdentifierSchema` and
 * values are integers validated by `errorCodeSchema`.
 *
 * Error messages are prefixed with `ErrorItems: ...` and follow the
 * standardized messaging provided by the common Map schema utilities. The Map
 * must contain at least one entry.
 *
 * Validation rules:
 * - Requires a `Map` instance
 * - Requires at least one entry (non-empty)
 * - Each key must satisfy `dataElementIdentifierSchema` (text)
 * - Each value must satisfy `errorCodeSchema` (int)
 *
 * ```cddl
 * ErrorItems = {+ DataElementIdentifier => ErrorCode}
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
 * @see dataElementIdentifierSchema
 * @see errorCodeSchema
 * @see createMapSchema
 */
export const errorItemsSchema = createMapSchema({
  target: 'ErrorItems',
  keySchema: dataElementIdentifierSchema,
  valueSchema: errorCodeSchema,
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
