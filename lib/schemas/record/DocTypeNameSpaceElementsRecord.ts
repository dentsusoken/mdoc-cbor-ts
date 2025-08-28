import { z } from 'zod';
import { createRecordSchema } from '../common/Record';
import { docTypeSchema } from '../common/DocType';
import { nameSpaceElementsRecordSchema } from './NameSpaceElementsRecord';

/**
 * Schema for document types containing namespace elements records
 * @description
 * Validates a required, non-empty record of `DocType` to `NameSpaceElementsRecord`. This represents
 * a hierarchical structure where each document type contains multiple namespaces with their
 * respective data elements.
 *
 * Validation rules:
 * - Requires input to be a record
 * - Disallows empty records (at least one document type is required)
 * - Keys must satisfy {@link DocType}
 * - Values must satisfy {@link NameSpaceElementsRecord}
 *
 * Error messages are prefixed with the target name: `DocTypeNameSpaceElementsRecord: ...`.
 *
 * ```cddl
 * DocTypeNameSpaceElementsRecord = {
 *   + DocType => NameSpaceElementsRecord
 * }
 * ```
 *
 * @example
 * ```typescript
 * const docTypeNameSpaceElementsRecord = {
 *   'org.iso.18013.5.1.mDL': {
 *     'org.iso.18013.5.1': {
 *       'given_name': 'John',
 *       'family_name': 'Doe'
 *     }
 *   }
 * };
 * const result = docTypeNameSpaceElementsRecordSchema.parse(docTypeNameSpaceElementsRecord); // Returns DocTypeNameSpaceElementsRecord
 * ```
 *
 * @see {@link DocType}
 * @see {@link NameSpaceElementsRecord}
 */
export const docTypeNameSpaceElementsRecordSchema = createRecordSchema({
  target: 'DocTypeNameSpaceElementsRecord',
  keySchema: docTypeSchema,
  valueSchema: nameSpaceElementsRecordSchema,
});

/**
 * Type representing a record of document types to namespace elements records
 * @description
 * A record where each key is a document type and each value is a namespace elements record.
 * This type is inferred from the `docTypeNameSpaceElementsRecordSchema`.
 */
export type DocTypeNameSpaceElementsRecord = z.output<
  typeof docTypeNameSpaceElementsRecordSchema
>;
