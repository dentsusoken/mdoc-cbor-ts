import { z } from 'zod';
import { DataElementIdentifier, dataElementIdentifierSchema } from '../common';

/**
 * Schema for data elements array in MSO
 * @description
 * Represents an array of data element identifiers.
 * This schema validates that the array contains at least one valid data element identifier.
 *
 * @example
 * ```typescript
 * const elements = ["given_name", "family_name"];
 * const result = dataElementsArraySchema.parse(elements); // Returns DataElementsArray
 * ```
 */
export const dataElementsArraySchema = z
  .array(dataElementIdentifierSchema)
  .nonempty();

/**
 * Type definition for data elements array
 * @description
 * Represents a validated array of data element identifiers
 *
 * ```cddl
 * DataElementsArray = [+ DataElementIdentifier]
 * ```
 * @see {@link DataElementIdentifier}
 */
export type DataElementsArray = z.infer<typeof dataElementsArraySchema>;
