import { z } from 'zod';
import { createMapSchema } from '@/schemas/containers/Map';

/**
 * Schema for document errors in MDOC
 * @description
 * Validates a required non-empty `Map<DocType, ErrorCode>`, where:
 * - Keys are non-empty strings representing DocType (directly defined as `z.string().min(1)`)
 * - Values are integers representing ErrorCode (directly defined as `z.number().int()`)
 *
 * Error messages are prefixed with `DocumentError: ...` and use the standardized messaging from the common Map schema utilities. The Map must have at least one entry.
 *
 * Validation rules:
 * - Requires a `Map` instance
 * - Map must not be empty (non-empty)
 * - Each key must be a non-empty string (DocType)
 * - Each value must be an integer (ErrorCode)
 *
 * ```cddl
 * DocumentError = {+ DocType => ErrorCode}
 * ```
 *
 * @example
 * ```typescript
 * const errors = new Map<string, number>([['org.iso.18013.5.1', 0]]);
 * const result = documentErrorSchema.parse(errors); // Map<DocType, ErrorCode>
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty map is not allowed)
 * // documentErrorSchema.parse(new Map());
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (not a Map)
 * // documentErrorSchema.parse({ 'org.iso.18013.5.1': 0 });
 * ```
 *
 * @see createMapSchema
 */
export const documentErrorSchema = createMapSchema({
  target: 'DocumentError',
  keySchema: z.string().min(1), // DocType as non-empty string
  valueSchema: z.number().int(), // ErrorCode as integer
  nonempty: true,
});

/**
 * Type definition for document errors
 * @description
 * Represents a validated record of DocType strings and their error codes (integers).
 *
 * This type is inferred from {@link documentErrorSchema} and allows for type-safe handling of document errors.
 */
export type DocumentError = z.output<typeof documentErrorSchema>;
