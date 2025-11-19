import { z } from 'zod';
import { createStrictMapSchema } from '@/schemas/containers/StrictMap';
import { createArraySchema } from '../containers/Array';
import { documentSchema } from './Document';
import { documentErrorSchema } from './DocumentError';
import { MdocStatus } from '@/mdoc/types';
import { createStrictMap } from '@/strict-map/createStrictMap';

/**
 * Entries definition for the mdoc schema.
 * @description
 * Specifies the fields and validation schemas for the MDoc (Mobile Document) response structure as used in the mdoc protocol.
 *
 * Structure:
 * - "version" (required): Validated as the literal string '1.0'.
 * - "documents" (optional): An array of validated Document structures, representing the documents contained in the response.
 *   - If present, the array must be non-empty (nonempty: true).
 * - "documentErrors" (optional): An array of validated DocumentError structures, representing any document-specific errors.
 *   - If present, the array must be non-empty (nonempty: true).
 * - "status" (required): Validated as a member of the ResponseStatus enum.
 *
 * Note:
 * - Both "documents" and "documentErrors" are optional and may be provided independently or together.
 * - If present, the "documents" and "documentErrors" arrays must be non-empty due to `nonempty: true`.
 *
 * @example
 * ```typescript
 * // Example with documents (documents must be non-empty)
 * const response = new Map([
 *   ['version', '1.0'],
 *   ['documents', [validDocument]],
 *   ['status', ResponseStatus.OK]
 * ]);
 *
 * // Example with documentErrors (documentErrors must be non-empty)
 * const errorResponse = new Map([
 *   ['version', '1.0'],
 *   ['documentErrors', [validDocumentError]],
 *   ['status', ResponseStatus.CborValidationError]
 * ]);
 *
 * // Example with both documents and documentErrors
 * const mixedResponse = new Map([
 *   ['version', '1.0'],
 *   ['documents', [validDocument]],
 *   ['documentErrors', [validDocumentError]],
 *   ['status', ResponseStatus.OK]
 * ]);
 * ```
 *
 * @see {@link documentSchema}
 * @see {@link documentErrorSchema}
 * @see {@link MdocStatus}
 */
export const mdocEntries = [
  ['version', z.literal('1.0')],
  [
    'documents',
    createArraySchema({
      target: 'documents',
      itemSchema: documentSchema,
      nonempty: true,
    }).optional(),
  ],
  [
    'documentErrors',
    createArraySchema({
      target: 'documentErrors',
      itemSchema: documentErrorSchema,
      nonempty: true,
    }).optional(),
  ],
  ['status', z.nativeEnum(MdocStatus)],
] as const;

/**
 * Factory function for constructing an mdoc-compliant response Map.
 *
 * @description
 * `createMdoc` builds a strict key-to-value Map structure that represents a mobile document (mdoc) response envelope,
 * enforcing the required version, optional non-empty documents and documentErrors arrays, and a required status.
 * The resulting structure strictly matches the expected mdoc CDDL.
 *
 * @see {@link mdocEntries} - The descriptor array for allowed keys, value types, and requirements.
 *
 * @example <caption>With documents</caption>
 * ```typescript
 * const mdoc = createMdoc([
 *   ['version', '1.0'],
 *   ['documents', [validDocument]],
 *   ['status', MdocStatus.OK],
 * ]);
 * ```
 *
 * @example <caption>With documentErrors</caption>
 * ```typescript
 * const errorMdoc = createMdoc([
 *   ['version', '1.0'],
 *   ['documentErrors', [validDocumentError]],
 *   ['status', MdocStatus.CborValidationError],
 * ]);
 * ```
 *
 * @example <caption>With both documents and documentErrors</caption>
 * ```typescript
 * const mixedMdoc = createMdoc([
 *   ['version', '1.0'],
 *   ['documents', [validDocument]],
 *   ['documentErrors', [validDocumentError]],
 *   ['status', MdocStatus.OK],
 * ]);
 * ```
 */
export const createMdoc = createStrictMap<typeof mdocEntries>;

/**
 * Zod schema for the mdoc structure.
 *
 * @description
 * This schema validates the core Mobile Document response envelope, enforcing its expected shape:
 * - version: Must be the literal string '1.0'.
 * - documents (optional): An array of validated Document structures. If present, the array must be non-empty.
 * - documentErrors (optional): An array of validated DocumentError structures. If present, the array must be non-empty.
 * - status: Required. Must be a value of the ResponseStatus enum (OK, GeneralError, CborDecodingError, CborValidationError).
 *
 * **Validation Rules:**
 * - 'documents' and 'documentErrors' are both optional and may co-exist or be absent.
 * - If present, arrays for 'documents' and 'documentErrors' must not be empty.
 *
 * @cddl
 * ```cddl
 * MDoc = {
 *   version: Version,
 *   ? documents: [+ Document],
 *   ? documentErrors: [+ DocumentError],
 *   status: uint ; 0=OK, 10=GeneralError, 11=CborDecodingError, 12=CborValidationError
 * }
 * ```
 *
 * @see {@link MdocStatus}
 * @see {@link documentSchema}
 * @see {@link documentErrorSchema}
 * @see {@link mdocEntries}
 *
 * @example <caption>With documents</caption>
 * ```typescript
 * const response = new Map([
 *   ['version', '1.0'],
 *   ['documents', [validDocument]],
 *   ['status', ResponseStatus.OK],
 * ]);
 * const parsed = mdocSchema.parse(response);
 * ```
 * @example <caption>With documentErrors</caption>
 * ```typescript
 * const errorResponse = new Map([
 *   ['version', '1.0'],
 *   ['documentErrors', [validDocumentError]],
 *   ['status', ResponseStatus.CborValidationError],
 * ]);
 * const parsed = mdocSchema.parse(errorResponse);
 * ```
 * @example <caption>With both documents and documentErrors</caption>
 * ```typescript
 * const mixed = new Map([
 *   ['version', '1.0'],
 *   ['documents', [validDocument]],
 *   ['documentErrors', [validDocumentError]],
 *   ['status', ResponseStatus.OK],
 * ]);
 * const parsed = mdocSchema.parse(mixed);
 * ```
 */
export const mdocSchema = createStrictMapSchema({
  target: 'Mdoc',
  entries: mdocEntries,
});

/**
 * Type representing an mdoc response structure.
 * Contains version, documents or documentErrors, and status information.
 */
export type Mdoc = z.output<typeof mdocSchema>;
