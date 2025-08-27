import { z } from 'zod';
import { createRecordSchema } from '../common/Record';
import { docTypeSchema } from '../common/DocType';
import { nameSpacesRecordSchema } from './NameSpacesRecord';

/**
 * Schema for document types containing name spaces records
 * @description
 * Validates a required, non-empty record of `DocType` to `NameSpacesRecord`. This represents
 * a hierarchical structure where each document type contains multiple name spaces with their
 * respective data elements.
 *
 * Validation rules:
 * - Requires input to be a record
 * - Disallows empty records (at least one document type is required)
 * - Keys must satisfy {@link DocType}
 * - Values must satisfy {@link NameSpacesRecord}
 *
 * Error messages are prefixed with the target name: `DocTypesRecord: ...`.
 *
 * ```cddl
 * DocTypesRecord = {
 *   + DocType => NameSpacesRecord
 * }
 * ```
 *
 * @example
 * ```typescript
 * const docTypesRecord = {
 *   'org.iso.18013.5.1.mDL': {
 *     'org.iso.18013.5.1': {
 *       'given_name': 'John',
 *       'family_name': 'Doe'
 *     }
 *   }
 * };
 * const result = docTypesRecordSchema.parse(docTypesRecord); // Returns Record<DocType, NameSpacesRecord>
 * ```
 *
 * @see {@link DocType}
 * @see {@link NameSpacesRecord}
 */
export const docTypesRecordSchema = createRecordSchema({
  target: 'DocTypesRecord',
  keySchema: docTypeSchema,
  valueSchema: nameSpacesRecordSchema,
});

export type DocTypesRecord = z.output<typeof docTypesRecordSchema>;
