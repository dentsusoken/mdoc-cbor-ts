import { z } from 'zod';

/**
 * Schema for data element identifiers
 * @description
 * Represents a string identifier used to uniquely identify data elements within the mdoc structure.
 * This schema validates that the identifier is a valid string.
 *
 * ```cddl
 * DataElementIdentifier = text
 * ```
 *
 * @example
 * ```typescript
 * const validId = "org.iso.18013.5.1";
 * const result = dataElementIdentifierSchema.parse(validId); // Returns string
 * ```
 */
export const dataElementIdentifierSchema = z
  .string({
    required_error:
      'DataElementIdentifier: This field is required. Please provide a string identifier.',
    invalid_type_error:
      'DataElementIdentifier: Expected a string, but received a different type. Please provide a string identifier.',
  })
  .min(1, {
    message:
      'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
  })
  .refine((val) => val.trim().length > 0, {
    message:
      'DataElementIdentifier: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1")',
  });

/**
 * Type definition for data element identifiers
 * @description
 * Represents a validated string identifier for data elements
 *
 * ```cddl
 * DataElementIdentifier = text
 * ```
 */
export type DataElementIdentifier = z.output<
  typeof dataElementIdentifierSchema
>;
