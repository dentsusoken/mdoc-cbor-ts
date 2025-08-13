import { z } from 'zod';
import { dataElementIdentifierSchema } from '../common';

// Error messages
export const DATA_ELEMENTS_ARRAY_INVALID_TYPE_MESSAGE =
  'DataElementsArray: Expected an array of DataElementIdentifier (strings)';
export const DATA_ELEMENTS_ARRAY_REQUIRED_MESSAGE =
  'DataElementsArray: This field is required. Please provide an array of DataElementIdentifier (strings).';
export const DATA_ELEMENTS_ARRAY_NON_EMPTY_MESSAGE =
  'DataElementsArray: Please provide at least one DataElementIdentifier';

/**
 * Schema for data elements array in MSO
 * @description
 * Represents an array of data element identifiers.
 * This schema validates that the array contains at least one valid data element identifier.
 *
 * ```cddl
 * DataElementsArray = [+ DataElementIdentifier]
 * ```
 *
 * @example
 * ```typescript
 * const elements = ["given_name", "family_name"];
 * const result = dataElementsArraySchema.parse(elements); // Returns DataElementsArray
 * ```
 */
export const dataElementsArraySchema = z
  .array(dataElementIdentifierSchema, {
    invalid_type_error: DATA_ELEMENTS_ARRAY_INVALID_TYPE_MESSAGE,
    required_error: DATA_ELEMENTS_ARRAY_REQUIRED_MESSAGE,
  })
  .nonempty({
    message: DATA_ELEMENTS_ARRAY_NON_EMPTY_MESSAGE,
  });

/**
 * Type definition for data elements array
 * @description
 * Represents a validated array of data element identifiers
 *
 * @see {@link DataElementIdentifier}
 */
export type DataElementsArray = z.output<typeof dataElementsArraySchema>;
