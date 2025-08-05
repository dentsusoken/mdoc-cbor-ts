import { z } from 'zod';

/**
 * Schema for document type identifiers
 * @description
 * Represents a string identifier that specifies the type of document.
 * This schema validates that the document type is a valid string.
 *
 * ```cddl
 * DocType = text
 * ```
 *
 * @example
 * ```typescript
 * const validDocType = "org.iso.18013.5.1.mDL";
 * const result = docTypeSchema.parse(validDocType); // Returns string
 * ```
 */
export const docTypeSchema = z
  .string({
    required_error:
      'DocType: This field is required. Please provide a string identifier.',
    invalid_type_error:
      'DocType: Expected a string, but received a different type. Please provide a string identifier.',
  })
  .min(1, {
    message:
      'DocType: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1.mDL")',
  })
  .refine((val) => val.trim().length > 0, {
    message:
      'DocType: Please provide a non-empty string identifier (e.g., "org.iso.18013.5.1.mDL")',
  });

/**
 * Type definition for document types
 * @description
 * Represents a validated string identifier for document types
 *
 * ```cddl
 * DocType = text
 * ```
 */
export type DocType = z.output<typeof docTypeSchema>;
