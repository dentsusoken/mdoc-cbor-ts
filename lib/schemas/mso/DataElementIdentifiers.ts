import { z } from 'zod';
import { dataElementIdentifierSchema } from '@/schemas/common/DataElementIdentifier';
import { createArraySchema } from '@/schemas/common/container/Array';

/**
 * Schema for DataElementIdentifiers in MSO
 * @description
 * Validates a required, non-empty array of `DataElementIdentifier` values. Each item in the array must satisfy the `dataElementIdentifierSchema` (a text identifier). The schema enforces that the array is not empty and that all elements are valid data element identifiers. Error messages are prefixed with `DataElementIdentifiers: ...`.
 *
 * Validation rules:
 * - The value must be an array.
 * - The array must contain at least one item (non-empty).
 * - Each item must be a valid `DataElementIdentifier` (string).
 *
 * ```cddl
 * DataElementIdentifiers = [+ DataElementIdentifier]
 * ```
 *
 * @example
 * ```typescript
 * // Valid usage
 * const elements = ["given_name", "family_name"];
 * const result = dataElementIdentifiersSchema.parse(elements); // Returns string[]
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError: empty array is not allowed
 * // dataElementIdentifiersSchema.parse([]);
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError: input is not an array
 * // dataElementIdentifiersSchema.parse({ given_name: true });
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError: invalid element type
 * // dataElementIdentifiersSchema.parse([123]);
 * ```
 *
 * @see {@link dataElementIdentifierSchema}
 */
export const dataElementIdentifiersSchema = createArraySchema({
  target: 'DataElementIdentifiers',
  itemSchema: dataElementIdentifierSchema,
});

/**
 * Type definition for DataElementIdentifiers
 * @description
 * Represents a validated, non-empty array of data element identifiers.
 *
 * @see {@link dataElementIdentifierSchema}
 */
export type DataElementIdentifiers = z.output<
  typeof dataElementIdentifiersSchema
>;
