import { z } from 'zod';
import { createNonEmptyTextSchema } from './NonEmptyText';

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
export const dataElementIdentifierSchema = createNonEmptyTextSchema(
  'DataElementIdentifier'
);

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
