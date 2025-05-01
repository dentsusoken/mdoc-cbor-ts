import { z } from 'zod';

/**
 * Schema for namespace identifiers
 * @description
 * Represents a string identifier that defines a namespace for data elements.
 * This schema validates that the namespace is a valid string.
 *
 * @example
 * ```typescript
 * const validNamespace = "org.iso.18013.5.1";
 * const result = nameSpaceSchema.parse(validNamespace); // Returns string
 * ```
 */
export const nameSpaceSchema = z.string().min(1);

/**
 * Type definition for namespaces
 * @description
 * Represents a validated string identifier for namespaces
 */
export type NameSpace = z.infer<typeof nameSpaceSchema>;
