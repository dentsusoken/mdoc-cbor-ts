import { z } from 'zod';

/**
 * Schema for document type identifiers
 * @description
 * Represents a string identifier that specifies the type of document.
 * This schema validates that the document type is a valid string.
 *
 * @example
 * ```typescript
 * const validDocType = "org.iso.18013.5.1.mDL";
 * const result = docTypeSchema.parse(validDocType); // Returns string
 * ```
 */
export const docTypeSchema = z.string();

/**
 * Type definition for document types
 * @description
 * Represents a validated string identifier for document types
 */
export type DocType = z.infer<typeof docTypeSchema>;
