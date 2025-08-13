import { z } from 'zod';
import { dataElementIdentifierSchema } from '@/schemas/common/DataElementIdentifier';
import { createArraySchema } from '@/schemas/common/Array';

/**
 * Schema for data elements array in MSO
 * @description
 * Validates a required non-empty array of `DataElementIdentifier` values. Error
 * messages are prefixed with `DataElementsArray: ...` and follow the
 * standardized text identifier validation provided by
 * `dataElementIdentifierSchema`.
 *
 * Validation rules:
 * - Requires an array type
 * - Requires at least one item (non-empty)
 * - Each item must satisfy `dataElementIdentifierSchema` (text)
 *
 * ```cddl
 * DataElementsArray = [+ DataElementIdentifier]
 * ```
 *
 * @example
 * ```typescript
 * const elements = ["given_name", "family_name"];
 * const result = dataElementsArraySchema.parse(elements); // string[]
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty array is not allowed)
 * // dataElementsArraySchema.parse([]);
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (not an array)
 * // dataElementsArraySchema.parse({ given_name: true });
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid element type)
 * // dataElementsArraySchema.parse([123]);
 * ```
 *
 * @see dataElementIdentifierSchema
 */
export const dataElementsArraySchema = createArraySchema({
  target: 'DataElementsArray',
  itemSchema: dataElementIdentifierSchema,
});

/**
 * Type definition for data elements array
 * @description
 * Represents a validated array of data element identifiers
 *
 * @see {@link DataElementIdentifier}
 */
export type DataElementsArray = z.output<typeof dataElementsArraySchema>;
