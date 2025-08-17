import { z } from 'zod';
import { createNonEmptyTextSchema } from './NonEmptyText';

/**
 * Schema for namespace identifiers
 * @description
 * Represents a string identifier that defines a namespace for data elements.
 * This schema validates that the namespace is a valid string.
 *
 * ```cddl
 * NameSpace = text
 * ```
 *
 * @example
 * ```typescript
 * const validNamespace = "org.iso.18013.5.1";
 * const result = nameSpaceSchema.parse(validNamespace); // Returns string
 * ```
 */
export const nameSpaceSchema = createNonEmptyTextSchema('NameSpace');

/**
 * Type definition for namespaces
 * @description
 * Represents a validated string identifier for namespaces
 */
export type NameSpace = z.output<typeof nameSpaceSchema>;
