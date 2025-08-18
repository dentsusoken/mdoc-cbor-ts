import { z } from 'zod';
import { docTypeSchema } from '@/schemas/common/DocType';
import { errorCodeSchema } from './ErrorCode';
import { createMapSchema } from '@/schemas/common/Map';

/**
 * Schema for document errors in MDOC
 * @description
 * Validates a required non-empty `Map<DocType, ErrorCode>`, where keys are
 * document types validated by `docTypeSchema` and values are integers validated
 * by `errorCodeSchema`.
 *
 * Error messages are prefixed with `DocumentError: ...` and follow the
 * standardized messaging provided by the common Map schema utilities. The Map
 * must contain at least one entry.
 *
 * Validation rules:
 * - Requires a `Map` instance
 * - Requires at least one entry (non-empty)
 * - Each key must satisfy `docTypeSchema` (text)
 * - Each value must satisfy `errorCodeSchema` (int)
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
 * @see docTypeSchema
 * @see errorCodeSchema
 * @see createMapSchema
 */
export const documentErrorSchema = createMapSchema({
  target: 'DocumentError',
  keySchema: docTypeSchema,
  valueSchema: errorCodeSchema,
});

/**
 * Type definition for document errors
 * @description
 * Represents a validated record of document types and their error codes
 *
 * @see {@link DocType}
 * @see {@link ErrorCode}
 */
export type DocumentError = z.output<typeof documentErrorSchema>;
