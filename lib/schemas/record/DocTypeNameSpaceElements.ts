import { z } from 'zod';
import { createRecordSchema } from '../common/Record';
import { docTypeSchema } from '../common/DocType';
import { nameSpaceElementsSchema } from './NameSpaceElements';

/**
 * Schema for document types containing namespace elements
 * @description
 * Validates a required, non-empty record of `DocType` to `NameSpaceElements`. This represents
 * a hierarchical structure where each document type contains multiple namespaces with their
 * respective data elements.
 *
 * Validation rules:
 * - Requires input to be a record
 * - Disallows empty records (at least one document type is required)
 * - Keys must satisfy {@link DocType}
 * - Values must satisfy {@link NameSpaceElements}
 *
 * Error messages are prefixed with the target name: `DocTypeNameSpaceElements: ...`.
 *
 * ```cddl
 * DocTypeNameSpaceElements = {
 *   + DocType => NameSpaceElements
 * }
 * ```
 *
 * @example
 * ```typescript
 * const docTypeNameSpaceElements = {
 *   'org.iso.18013.5.1.mDL': {
 *     'org.iso.18013.5.1': {
 *       'given_name': 'John',
 *       'family_name': 'Doe'
 *     }
 *   }
 * };
 * const result = docTypeNameSpaceElementsSchema.parse(docTypeNameSpaceElements); // Returns DocTypeNameSpaceElements
 * ```
 *
 * @see {@link DocType}
 * @see {@link NameSpaceElements}
 */
export const docTypeNameSpaceElementsSchema = createRecordSchema({
  target: 'DocTypeNameSpaceElements',
  keySchema: docTypeSchema,
  valueSchema: nameSpaceElementsSchema,
});

/**
 * Type representing a record of document types to namespace elements
 * @description
 * A record where each key is a document type and each value is a namespace elements.
 * This type is inferred from the `docTypeNameSpaceElementsSchema`.
 */
export type DocTypeNameSpaceElements = z.output<
  typeof docTypeNameSpaceElementsSchema
>;
