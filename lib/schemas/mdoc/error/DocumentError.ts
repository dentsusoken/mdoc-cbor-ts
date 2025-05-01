import { z } from 'zod';
import { DocType, docTypeSchema, Entry } from '../../common';
import { ErrorCode, errorCodeSchema } from './ErrorCode';

/**
 * Schema for document errors in MDOC
 * @description
 * Represents a record of document types and their corresponding error codes.
 * This schema validates that each document type maps to a valid error code.
 *
 * @example
 * ```typescript
 * const errors = {
 *   "org.iso.18013.5.1": 0
 * };
 * const result = documentErrorSchema.parse(errors); // Returns DocumentError
 * ```
 */
export const documentErrorSchema = z
  .record(docTypeSchema, errorCodeSchema)
  .refine((data) => {
    return Object.keys(data).length > 0;
  });

/**
 * Type definition for document errors
 * @description
 * Represents a validated record of document types and their error codes
 *
 * ```cddl
 * DocumentError = {+ DocType => ErrorCode}
 * ```
 * @see {@link DocType}
 * @see {@link ErrorCode}
 */
export type DocumentError = z.infer<typeof documentErrorSchema>;

/**
 * Type definition for document error entries
 * @description
 * Represents a key-value pair from the document errors record
 */
export type DocumentErrorEntry = Entry<DocumentError>;
